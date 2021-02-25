export const BLINKER_ALIGENIE_LIGHT = 'light'
export const BLINKER_ALIGENIE_OUTLET = 'outlet'
export const BLINKER_ALIGENIE_MULTI_OUTLET = 'multi_outlet'
export const BLINKER_ALIGENIE_SENSOR = 'sensor'

export const BLINKER_DUEROS_LIGHT = 'LIGHT'
export const BLINKER_DUEROS_OUTLET = 'SOCKET'
export const BLINKER_DUEROS_MULTI_OUTLET = 'MULTI_SOCKET'
export const BLINKER_DUEROS_SENSOR = 'AIR_MONITOR'

export const BLINKER_MIOT_LIGHT = 'light'
export const BLINKER_MIOT_OUTLET = 'outlet'
export const BLINKER_MIOT_MULTI_OUTLET = 'multi_outlet'
export const BLINKER_MIOT_SENSOR = 'sensor'

export enum VA_TYPE {
    LIGHT = 'light',
    OUTLET = 'outlet',
    MULTI_OUTLET = 'multi_outlet',
    SENSOR = 'sensor'
}

import { Subject } from "rxjs";
import { BlinkerDevice } from "./blinker";
import { API } from './server.config'
import axios from 'axios';
import { u8aToString } from "./fun"

export class VoiceAssistant {

    get subTopic() {
        return `/sys/${this.device.config.productKey}/${this.device.config.deviceName}/rrpc/request/+`
    }

    get pubTopic() {
        return `/sys/${this.device.config.productKey}/${this.device.config.deviceName}/rrpc/response/`
    }

    vaType;

    device: BlinkerDevice;

    change = new Subject()

    constructor(key) {
        this.vaType = key
    }



    // get message() {
    //     return `{"fromDevice": "${this.device.deviceName}", "toDevice": "${this.vaType}_r", "data": ${} , "deviceType": "vAssistant"}`
    // }

    listen() {
        this.device.mqttClient.on('message', (topic, message) => {
            if (topic == this.subTopic) {
                let messageString = u8aToString(message)
                console.log(topic);
                console.log(messageString);
            }
        })
        // return this.change
    }

    unlisten() {
        // this.changeSubscription.unsubscribe();
    }

    update(value = '') {
        let message = {}
        // message[this.key] = this.state
        this.device.sendMessage(message)
    }

    powerState = new Subject();
    mode = new Subject();
    color = new Subject();
    colorTemp = new Subject();
    brightness = new Subject();
    temp = new Subject();
    humi = new Subject();
    pm25 = new Subject();

}

export class Miot extends VoiceAssistant {

    constructor(key) {
        super(key)
        this.vaType = { miType: key }
    }
}

export class AliGenie extends VoiceAssistant {

    constructor(key) {
        super(key)
        this.vaType = { aliType: key }
    }
}

export class DuerOS extends VoiceAssistant {

    constructor(key) {
        super(key)
        let newkey;
        switch (key) {
            case VA_TYPE.LIGHT:
                newkey = 'LIGHT'
                break;
            case VA_TYPE.OUTLET:
                newkey = 'SOCKET'
                break;
            case VA_TYPE.MULTI_OUTLET:
                newkey = 'MULTI_SOCKET'
                break;
            case VA_TYPE.SENSOR:
                newkey = 'AIR_MONITOR'
                break;
        }
        this.vaType = { duerType: newkey }
    }

}