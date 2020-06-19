import * as mqtt from 'mqtt';
import axios from 'axios';
// import Rx from 'rxjs/Rx';

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

        this.mqttClient = mqtt.connect('mqtt://' + this.config.host + ':' + this.config.port, {
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

    connectBroker_Blinker() {

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