// import { connect } from 'mqtt';
// import axios from './node_modules/axios';
const axios = require('axios');
var mqtt = require('mqtt');
const host = 'https://iot.diandeng.tech';
const url = host + '/api/v1/user/device/diy/auth?authKey='

export class Device {
    mqttClient;

    config;
    host;
    port;
    subtopic;
    pubtopic;
    clientId;
    username;
    deviceName;
    password;
    uuid;

    constructor(authkey) {
        this.init(authkey)
    }

    init(authkey) {
        axios.get(url + authkey).then(resp => {
            console.log(resp.data);
            this.config = resp.data.detail
            this.connectBroker()
        })
    }

    connectBroker() {
        if (this.config.broker == 'aliyun') {
            this.host = 'public.iot-as-mqtt.cn-shanghai.aliyuncs.com'
            this.port = 1883;
            this.subtopic = `/${this.config.productKey}/${this.config.deviceName}/r`;
            this.pubtopic = `/${this.config.productKey}/${this.config.deviceName}/s`;
            this.clientId = this.config.deviceName;
            this.username = this.config.iotId;
            this.deviceName = this.config.deviceName
            this.password = this.config.iotToken
            this.uuid = this.config.uuid
        }

        this.mqttClient = mqtt.connect('mqtt://' + this.host + ':' + this.port, {
            clientId: this.clientId,
            username: this.username,
            password: this.password,
        });

        this.mqttClient.on('connect', () => {
            this.mqttClient.subscribe(this.subtopic);
            console.log('blinker connected');
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
            console.log(data);
            if (JSON.stringify(data) == '{"get":"state"}') {
                console.log(format(this.clientId, fromDevice, "{'state':'online'}"));
                this.mqttClient.publish(this.pubtopic, format(this.clientId, fromDevice, `{"state":"online"}`))
            }
        })

        this.mqttClient.on('error', (err) => {
            console.log(err);
        })
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