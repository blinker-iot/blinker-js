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

export enum MI_TYPE {
    LIGHT = 'light',
    OUTLET = 'outlet',
    MULTI_OUTLET = 'multi_outlet',
    SENSOR = 'sensor'
}

export enum ALI_TYPE {
    LIGHT = 'light',
    OUTLET = 'outlet',
    MULTI_OUTLET = 'multi_outlet',
    SENSOR = 'sensor'
}

export enum DUER_TYPE {
    LIGHT = 'LIGHT',
    OUTLET = 'SOCKET',
    MULTI_OUTLET = 'MULTI_SOCKET',
    SENSOR = 'AIR_MONITOR'
}


import { Subject } from "rxjs";
import { BlinkerDevice, Message } from "./blinker";

export class VoiceAssistant {

    subTopic = '';
    pubTopic = '';

    vaType = ''

    get message() {
        return `{"fromDevice": "${this.device.deviceName}", "toDevice": "${this.vaType}_r", "data": ${} , "deviceType": "vAssistant"}`
    }

    constructor(key) {
        this.key = key
    }

    listen() {
        this.changeSubscription = this.change.subscribe(message => {
            // console.log(message);
            this.device.targetDevice = message.fromDevice
            this.change2.next(message)
        })
        return this.change2
    }

    unlisten() {
        this.changeSubscription.unsubscribe();
    }

    update(value = '') {
        let message = {}
        message[this.key] = this.state
        this.device.sendMessage(message)
    }
    device: BlinkerDevice;
}

export class Miot extends VoiceAssistant {

}

export class AliGenie extends VoiceAssistant {

}


export class DuerOS extends VoiceAssistant {

}