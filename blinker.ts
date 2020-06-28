import * as mqtt from 'mqtt';
import axios from 'axios';
import { Subject } from 'rxjs';
import { Widget } from './widget';
import bonjour from 'bonjour';
// import { bonjour } from 'bonjour';

const host = 'https://iot.diandeng.tech';
const url = host + '/api/v1/user/device/diy/auth?authKey='

export interface Message {
    fromDevice?: string,
    data: any
}

export class BlinkerDevice {
    mqttClient;

    config: {
        broker: string,
        deviceName: string,
        host: string,
        iotId: string,
        iotToken: string,
        port: string,
        productKey: string,
        uuid: string
    };

    subtopic;
    pubtopic;

    deviceName;
    // password;

    targetDevice;

    dataRead = new Subject<Message>()

    heartbeat = new Subject<Message>()

    builtinSwitch = new BuiltinSwitch();

    widgetKeyList = []
    widgetDict = {}

    constructor(authkey) {
        this.init(authkey)
    }

    init(authkey, protocol = "mqtts") {
        axios.get(url + authkey + '&protocol=' + protocol).then(resp => {
            console.log(resp.data);
            this.config = resp.data.detail
            if (this.config.broker == 'aliyun') {
                this.initBroker_Aliyun()
            } else if (this.config.broker == 'blinker') {
                this.initBroker_Blinker()
            }
            this.connectBroker()
            this.addWidget(this.builtinSwitch)

            // 开启mdns服务
            bonjour().publish({
                name: this.config.deviceName,
                type: 'blinker',
                host: this.config.deviceName + '.local',
                port: 81
            })
        })
    }

    initBroker_Aliyun() {
        this.subtopic = `/${this.config.productKey}/${this.config.deviceName}/r`;
        this.pubtopic = `/${this.config.productKey}/${this.config.deviceName}/s`;
        this.targetDevice = this.config.uuid;
    }

    initBroker_Blinker() {
        this.subtopic = `/device/${this.config.deviceName}/r`;
        this.pubtopic = `/device/${this.config.deviceName}/s`;
        this.targetDevice = this.config.uuid;
    }

    connectBroker() {
        this.mqttClient = mqtt.connect(this.config.host + ':' + this.config.port, {
            clientId: this.config.deviceName,
            username: this.config.iotId,
            password: this.config.iotToken
        });

        this.mqttClient.on('connect', () => {
            console.log('blinker connected');
            this.mqttClient.subscribe(this.subtopic);
        })

        this.mqttClient.on('message', (topic, message) => {
            let data;
            let fromDevice;
            try {
                fromDevice = JSON.parse(u8aToString(message)).fromDevice
                data = JSON.parse(u8aToString(message)).data
            } catch (error) {
                console.log(error);
            }
            if (typeof data['get'] != 'undefined') {
                this.heartbeat.next(data);
                this.mqttClient.publish(this.pubtopic, formatMess2Device(this.config.deviceName, fromDevice, `{"state":"online"}`))
            } else {
                let otherData = {}
                for (const key in data) {
                    // 处理组件数据
                    if (this.widgetKeyList.indexOf(key) > -1) {
                        let widget: Widget = this.widgetDict[key]
                        widget.change.next({
                            fromDevice: fromDevice,
                            data: data[key],
                        })
                    } else {
                        let temp = {};
                        temp[key] = data[key]
                        otherData = Object.assign(otherData, temp)
                    }
                }
                if (JSON.stringify(otherData) != '{}')
                    this.dataRead.next({
                        fromDevice: fromDevice,
                        data: otherData
                    })
            }
        })

        this.mqttClient.on('error', (err) => {
            console.log(err);
        })
    }

    sendTimers = {};

    messageDataCache = {}

    sendMessage(message: string | Object, toDevice = this.targetDevice) {
        let sendMessage: string;
        if (typeof message == 'object') sendMessage = JSON.stringify(message)
        else sendMessage = message
        if (isJson(sendMessage)) {
            if (typeof this.messageDataCache[toDevice] == 'undefined') this.messageDataCache[toDevice] = '';
            let ob = this.messageDataCache[toDevice] == '' ? {} : JSON.parse(this.messageDataCache[toDevice]);
            let ob2 = JSON.parse(sendMessage)
            this.messageDataCache[toDevice] = JSON.stringify(Object.assign(ob, ob2))
            if (typeof this.sendTimers[toDevice] != 'undefined') clearTimeout(this.sendTimers[toDevice]);
            //检查设备是否是本地设备,是否已连接
            // let deviceInLocal = false;
            // if (this.islocalDevice(device)) {
            //     if (this.lanDeviceList[toDevice].state == 'connected')
            //         deviceInLocal = true
            // }
            this.sendTimers[toDevice] = setTimeout(() => {
                this.mqttClient.publish(this.pubtopic, formatMess2Device(this.config.deviceName, toDevice, this.messageDataCache[toDevice]))
                this.messageDataCache[toDevice] = '';
                delete this.sendTimers[toDevice];
            }, 100)
        } else {
            console.log('not json');
            if (!isNumber(sendMessage)) sendMessage = `"${sendMessage}"`
            this.mqttClient.publish(this.pubtopic, formatMess2Device(this.config.deviceName, toDevice, sendMessage))
        }
    }

    // toDevice
    sendMessage2Device(message, toDevice = this.targetDevice) {
        this.sendMessage(message, toDevice)
    }
    // toGrounp
    sendMessage2Grounp(message, toGrounp) {

    }
    // toStorage
    storageCache = [];
    tsDataTimer;
    saveTsData(data: any) {
        console.log(JSON.stringify(this.storageCache));
        clearTimeout(this.tsDataTimer);
        let currentData = Object.assign({ date: Math.floor((new Date).getTime() / 1000) }, data)
        if (this.storageCache.length == 0 || currentData.date - this.storageCache[this.storageCache.length - 1].date > 5) {
            this.storageCache.push(currentData)
        }
        this.tsDataTimer = setTimeout(() => {
            this.mqttClient.publish(this.pubtopic, formatMess2Storage(this.config.deviceName, 'ta', JSON.stringify(this.storageCache)))
            this.storageCache = []
        }, 60000);
    }

    saveObjectData(data: any) {

    }

    saveTextData(data: string) {

    }

    addWidget(widget: Widget | any): Widget | any {
        widget.device = this;
        this.widgetKeyList.push(widget.key);
        this.widgetDict[widget.key] = widget;
        return widget
    }

    vibrate(time = 500) {
        this.sendMessage(`{"vibrate":${time}}`)
    }

}

export class BuiltinSwitch {
    key = 'switch';
    state = '';
    change = new Subject<Message>();

    setState(state) {
        this.state = state
        return this
    }

    update() {
        let message = {}
        message[this.key] = this.state
        this.device.sendMessage(message)
    }
    device: BlinkerDevice;
}

function formatMess2Device(deviceId, toDevice, data) {
    // 兼容阿里broker保留deviceType
    return `{"deviceType":"OwnApp","data":${data},"fromDevice":"${deviceId}","toDevice":"${toDevice}"}`
}

function formatMess2Grounp(deviceId, toGrounp, data) {
    return `{"data":${data},"fromDevice":"${deviceId}","toGrounp":"${toGrounp}"}`
}

function formatMess2Storage(deviceId, storageType, data) {
    return `{"data":${data},"fromDevice":"${deviceId}","toStorage":"${storageType}"}`
}

function u8aToString(fileData) {
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
        dataString += String.fromCharCode(fileData[i]);
    }
    return dataString
}

function isJson(str: string) {
    if (isNumber(str)) {
        return false;
    }
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

function isNumber(val: string) {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if (regPos.test(val) || regNeg.test(val)) {
        return true;
    } else {
        // console.log("不是数字");
        return false;
    }
}