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

export enum MI_LIGHT_MODE {
    DAY,
    NIGHT,
    COLOR,
    WARMTH,
    TV,
    READING,
    COMPUTER,
}

export enum ALI_LIGHT_MODE {
    reading,
    movie,
    sleep,
    holiday,
    music,
    common
}

export enum DUER_LIGHT_MODE {
    READING,
    SLEEP,
    ALARM,
    DAYTIME,
    NIGHT_LIGHT,
    ROMANTIC,
    SUNDOWN,
    SUNRISE,
    RELAX,
    LIGHTING,
    SUN,
    STAR,
    ENERGY_SAVING,
    MOON,
    JUDI,
    HEAT,
    COOL
}

import { from, Subject } from "rxjs";
import { BlinkerDevice } from "./blinker";
import { API } from './server.config'
import axios from 'axios';
import { u8aToString } from "./fun"
import { Message } from "./message"
import { vaLog } from "./debug"

export class VoiceAssistant {

    get subTopic() {
        return `/sys/${this.device.config.productKey}/${this.device.config.deviceName}/rrpc/request/+`
    }

    get pubTopic() {
        return `/sys/${this.device.config.productKey}/${this.device.config.deviceName}/rrpc/response/`
    }

    vaType;
    vaName;

    device: BlinkerDevice;

    change = new Subject();

    targetDevice;

    powerChange = new Subject<powerMessage>();
    modeChange = new Subject<modeMessage>();
    colorChange = new Subject<colorMessage>();
    colorTempChange = new Subject<colorTempMessage>();
    brightnessChange = new Subject<brightnessMessage>();
    stateQuery = new Subject<dataMessage>();

    constructor(key) {
        this.vaType = key
    }

    listen() {
        this.device.mqttClient.on('message', (topic, message) => {
            if (topic.indexOf(this.subTopic.substr(0, this.subTopic.length - 1)) > -1) {
                let data;
                let fromDevice;
                let messageId;
                try {
                    let messageString = u8aToString(message)
                    let messageObject = JSON.parse(messageString)
                    fromDevice = messageObject.fromDevice
                    data = messageObject.data
                    this.targetDevice = fromDevice
                    messageId = topic.split('/')[6]
                } catch (error) {
                    console.log(error);
                }
                if (fromDevice == this.vaName)
                    this.processData(messageId, data)
            }
        })
    }

    unlisten() {
        // this.changeSubscription.unsubscribe();
    }


    processData(messageId, data) {
        console.log(data);

        if (typeof data.set != 'undefined') {
            if (typeof data.set.pState != 'undefined') {
                this.powerChange.next(new powerMessage(this.device, this, messageId, data))
            } else if (typeof data.set.col != 'undefined') {
                this.colorChange.next(new colorMessage(this.device, this, messageId, data))
            } else if (typeof data.set.clrtemp != 'undefined') {
                this.colorTempChange.next(new colorTempMessage(this.device, this, messageId, data))
            } else if (typeof data.set.mode != 'undefined') {
                this.modeChange.next(new modeMessage(this.device, this, messageId, data))
            } else if (typeof data.set.bright != 'undefined' || typeof data.set.upBright != 'undefined' || typeof data.set.downBright != 'undefined') {
                this.brightnessChange.next(new brightnessMessage(this.device, this, messageId, data))
            }
        } else if (typeof data.get != 'undefined') {
            this.stateQuery.next(new dataMessage(this.device, this, messageId, data))
        }
    }
}

export class Miot extends VoiceAssistant {

    constructor(key) {
        super(key)
        this.vaType = { miType: key }
        this.vaName = 'Miot'
    }

    mode(mode: MI_LIGHT_MODE) {
        return this
    }
}

export class AliGenie extends VoiceAssistant {

    constructor(key) {
        super(key)
        this.vaType = { aliType: key }
        this.vaName = 'AliGenie'
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
        this.vaName = 'DuerOS'
    }

}


export class VaMessage extends Message {
    id: number;
    device: BlinkerDevice;
    voiceAssistant: VoiceAssistant;

    get data() {
        return JSON.stringify(this.request)
    }

    request = {};
    response = {};

    constructor(device, voiceAssistant, id, request) {
        super(device)
        this.device = device
        this.id = id
        this.request = request
        this.voiceAssistant = voiceAssistant
        vaLog(this.data, `${this.voiceAssistant.vaName}>device`)
    }

    update() {
        let responseStr = JSON.stringify(this.response)
        let data = `{ "fromDevice": "${this.device.config.deviceName}", "toDevice": "${this.voiceAssistant.vaName}_r", "data": ${responseStr}, "deviceType": "vAssistant"}`
        let base64Data = Buffer.from(data).toString('base64')
        this.device.mqttClient.publish(this.voiceAssistant.pubTopic + this.id, base64Data)
        vaLog(responseStr, `device>${this.voiceAssistant.vaName}`)
    }

    // power(state: string) {
    //     let data = { pState: state }
    //     this.response = Object.assign(this.response, data)
    //     return this
    // }

    // mode(mode: number) {
    //     return this
    // }

    // color(color: string) {
    //     return this
    // }

    // colorTemp(colorTemp: number) {
    //     return this
    // }

    // brightness(brightness: number) {
    //     return this
    // }

    // temp(val: number) {
    //     return this
    // }

    // humi(val: number) {
    //     return this
    // }

    // pm25(val: number) {
    //     return this
    // }

    // co2(val: number) {
    //     return this
    // }

}

class powerMessage extends VaMessage {
    power(state: string) {
        let data = { pState: state }
        this.response = Object.assign(this.response, data)
        return this
    }
}

class modeMessage extends VaMessage {
    mode(state: string | number) {
        let data = { mode: state }
        this.response = Object.assign(this.response, data)
        return this
    }
}

class colorMessage extends VaMessage {
    color(color: string | number[]) {
        let data = { clr: color }
        this.response = Object.assign(this.response, data)
        return this
    }
}

class colorTempMessage extends VaMessage {
    colorTemp(state: string) {
        let data = { mode: state }
        this.response = Object.assign(this.response, data)
        return this
    }
}

class brightnessMessage extends VaMessage {
    brightness(val: number) {
        let data = { bright: val }
        this.response = Object.assign(this.response, data)
        return this
    }
}

class dataMessage extends VaMessage {
    temp(val: number) {
        let data = { temp: val }
        this.response = Object.assign(this.response, data)
        return this
    }

    humi(val: number) {
        let data = { humi: val }
        this.response = Object.assign(this.response, data)
        return this
    }

    pm25(val: number) {
        let data = { pm25: val }
        this.response = Object.assign(this.response, data)
        return this
    }

    co2(val: number) {
        let data = { co2: val }
        this.response = Object.assign(this.response, data)
        return this
    }
}