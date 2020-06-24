import * as mqtt from 'mqtt';
import axios from 'axios';
import { Subject } from 'rxjs';
import { Widget } from './widget';

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

    sendMessage(message: String | Object, toDevice = this.targetDevice) {
        let sendMessage: String;
        if (typeof message == 'object') sendMessage = JSON.stringify(message)
        else sendMessage = message
console.log(formatMess2Device(this.config.deviceName, toDevice, sendMessage));

        this.mqttClient.publish(this.pubtopic, formatMess2Device(this.config.deviceName, toDevice, sendMessage))
    }

    // toDevice
    sendMessage2Device(message, toDevice = this.targetDevice) {

    }
    // toGrounp
    sendMessage2Grounp(message, toGrounp) {

    }
    // toStorage
    saveTsData() {

    }

    saveObjectData() {

    }

    saveTextData() {

    }

    addWidget(widget: Widget | any): Widget | any {
        widget.device = this;
        this.widgetKeyList.push(widget.key);
        this.widgetDict[widget.key] = widget;
        return widget
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