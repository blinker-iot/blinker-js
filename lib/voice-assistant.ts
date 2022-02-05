export enum VA_TYPE {
    LIGHT = 'light',
    OUTLET = 'outlet',
    MULTI_OUTLET = 'multi_outlet',
    SENSOR = 'sensor',
    FAN = 'fan',
    AIRCONDITION = 'aircondition'
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
    READING = 'reading',
    MOVIE = 'movie',
    SLEEP = 'sleep',
    LIVE = 'live',
    HOLIDAY = 'holiday',
    MUSIC = 'music',
    COMMON = 'common',
    NIGHT = 'night'
}

export enum DUER_LIGHT_MODE {
    READING = 'READING',
    SLEEP = 'SLEEP',
    ALARM = 'ALARM',
    // DAYTIME = 'DAYTIME',
    NIGHT_LIGHT = 'NIGHT_LIGHT',
    ROMANTIC = 'ROMANTIC',
    SUNDOWN = 'SUNDOWN',
    SUNRISE = 'SUNRISE',
    RELAX = 'RELAX',
    LIGHTING = 'LIGHTING',
    SUN = 'SUN',
    STAR = 'STAR',
    ENERGY_SAVING = 'ENERGY_SAVING',
    MOON = 'MOON',
    JUDI = 'JUDI',
    // HEAT = 'HEAT',
    // COOL = 'COOL',
    // AUTO = 'AUTO'
}

import { Subject } from "rxjs";
import { BlinkerDevice } from "./blinker";
import { u8aToString } from "./fun"
import { Message } from "./message"
import { vaLog } from "./debug"

export class VoiceAssistant {

    get subTopic() {
        if (this.device.config.broker == 'blinker')
            return `/device/${this.device.config.deviceName}/r`
        return `/sys/${this.device.config.productKey}/${this.device.config.deviceName}/rrpc/request/+`
    }

    get pubTopic() {
        if (this.device.config.broker == 'blinker')
            return `/device/${this.device.config.deviceName}/s`
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
                    vaLog(data, `${this.vaName}>device`)
                } catch (error) {
                    console.log(error);
                }
                console.log(fromDevice,this.vaName);
                
                if (fromDevice == this.vaName)
                    this.processData(messageId, data)
            }
        })
    }

    unlisten() {
        // this.changeSubscription.unsubscribe();
    }


    processData(messageId, data) {
        // console.log(data);
        if (typeof data.set != 'undefined') {
            if (typeof data.set.pState != 'undefined') {
                this.powerChange.next(new powerMessage(this.device, this, messageId, data))
            } else if (typeof data.set.col != 'undefined') {
                this.colorChange.next(new colorMessage(this.device, this, messageId, data))
            } else if (typeof data.set.colTemp != 'undefined') {
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
        this.vaName = 'MIOT'
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

    get data(): any {
        return this.request
    }

    request = {};
    response = {};

    constructor(device, voiceAssistant, id, request) {
        super(device)
        this.device = device
        this.id = id
        this.request = request
        this.voiceAssistant = voiceAssistant
    }

    update() {
        let responseStr = JSON.stringify(this.response)
        let data = `{ "fromDevice": "${this.device.config.deviceName}", "toDevice": "${this.voiceAssistant.vaName}_r", "data": ${responseStr}, "deviceType": "vAssistant"}`
        let base64Data = Buffer.from(data).toString('base64')
        this.device.mqttClient.publish(this.voiceAssistant.pubTopic + this.id, base64Data)
        vaLog(responseStr, `device>${this.voiceAssistant.vaName}`)
    }
}

class powerMessage extends VaMessage {
    power(state: string) {
        let data = { pState: state }
        this.response = Object.assign(this.response, data)
        return this
    }

    num(num: number) {
        let data = { num: num }
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
    colorTemp(val: number) {
        let data = { colTemp: val }
        this.response = Object.assign(this.response, data)
        return this
    }
}

class brightnessMessage extends VaMessage {
    brightness(val: number | string) {
        if (typeof val == 'number') val = val.toString()
        let data = { bright: val }
        this.response = Object.assign(this.response, data)
        return this
    }
}

class dataMessage extends VaMessage {
    temp(val: number | string) {
        if (typeof val == 'number') val = val.toString()
        let data = { temp: val }
        this.response = Object.assign(this.response, data)
        return this
    }

    humi(val: number | string) {
        if (typeof val == 'number') val = val.toString()
        let data = { humi: val }
        this.response = Object.assign(this.response, data)
        return this
    }

    aqi(val: number | string) {
        if (typeof val == 'number') val = val.toString()
        let data = { aqi: val }
        this.response = Object.assign(this.response, data)
        return this
    }

    pm25(val: number | string) {
        if (typeof val == 'number') val = val.toString()
        let data = { pm25: val }
        this.response = Object.assign(this.response, data)
        return this
    }

    pm10(val: number | string) {
        if (typeof val == 'number') val = val.toString()
        let data = { pm10: val }
        this.response = Object.assign(this.response, data)
        return this
    }

    co2(val: number | string) {
        if (typeof val == 'number') val = val.toString()
        let data = { co2: val }
        this.response = Object.assign(this.response, data)
        return this
    }

    brightness(val: number | string) {
        if (typeof val == 'number') val = val.toString()
        let data = { bright: val }
        this.response = Object.assign(this.response, data)
        return this
    }

    color(color: string | number[]) {
        let data = { clr: color }
        this.response = Object.assign(this.response, data)
        return this
    }

    colorTemp(val: number | string) {
        if (typeof val == 'number') val = val.toString()
        let data = { colorTemp: val }
        this.response = Object.assign(this.response, data)
        return this
    }

    mode(state: string | number) {
        let data = { mode: state }
        this.response = Object.assign(this.response, data)
        return this
    }

    power(state: string) {
        if (this.voiceAssistant.vaName == 'MIOT') {
            if (state == 'on') state = 'true'
            else state = 'false'
        }
        let data = { pState: state }
        this.response = Object.assign(this.response, data)
        return this
    }
}