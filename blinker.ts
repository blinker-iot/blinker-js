import * as mqtt from 'mqtt';
import axios from 'axios';
import { Subject } from 'rxjs';
import { throws } from 'assert';
import { Widget } from './widget';

const host = 'https://iot.diandeng.tech';
const url = host + '/api/v1/user/device/diy/auth?authKey='

export class Device {
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
    host;
    port;
    subtopic;
    pubtopic;
    clientId;
    username;
    deviceName;
    password;
    uuid;

    subject_dataRead = new Subject()

    subject_heartbeat = new Subject()

    subject_builtinSwitch = new Subject()

    subject_widgets = new Subject()

    widgetKeyList = []
    widgetDict = {}

    constructor(authkey) {
        this.init(authkey)
    }

    init(authkey) {
        axios.get(url + authkey).then(resp => {
            console.log(resp.data);
            this.config = resp.data.detail
            if (this.config.broker == 'aliyun')
                this.connectBroker_Aliyun()
        })
    }

    register() {

    }

    connectBroker_Aliyun() {
        this.subtopic = `/${this.config.productKey}/${this.config.deviceName}/r`;
        this.pubtopic = `/${this.config.productKey}/${this.config.deviceName}/s`;
        this.uuid = this.config.uuid;

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
            // console.log(data);
            // this.subject_widgets.next
            if (typeof data['get'] != 'undefined') {
                this.subject_heartbeat.next(data);
                this.mqttClient.publish(this.pubtopic, format(this.clientId, fromDevice, `{"state":"online"}`))
            } else {
                let otherData = {}
                for (const key in data) {
                    // 处理组件数据
                    if (this.widgetKeyList.indexOf(key) > -1) {
                        this.widgetDict[key].change.next(data[key])
                    } else {
                        otherData = Object.assign(otherData, data[key])
                    }
                }
                if (JSON.stringify(otherData) != '{}')
                    this.subject_dataRead.next(otherData)
            }
        })

        this.mqttClient.on('error', (err) => {
            console.log(err);
        })
    }

    connectBroker_Blinker() {

    }

    sendMessage(message: String | Object, toDevice = this.uuid) {
        let sendMessage: String;
        if (typeof message == 'object') sendMessage = JSON.stringify(message)
        else sendMessage = message
        this.mqttClient.publish(this.pubtopic, format(this.clientId, toDevice, sendMessage))
    }

    addWidget(widget: Widget) {
        widget.device = this;
        this.widgetKeyList.push(widget.key);
        this.widgetDict[widget.key] = widget;
        return widget
    }

    processWidgets(data) {
        // if(data[])
    }

}

function format(deviceId, toDevice, data) {
    return `{"deviceType":"OwnApp","data":${data},"fromDevice":"${deviceId}","toDevice":"${toDevice}"}`
}

function u8aToString(fileData) {
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
        dataString += String.fromCharCode(fileData[i]);
    }

    return dataString
}