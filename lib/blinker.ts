import * as mqtt from 'mqtt';
import axios from 'axios';
import { BehaviorSubject, Subject } from 'rxjs';
import { Widget } from './widget';
import bonjour from 'bonjour';
import * as WebSocket from 'ws';
import * as schedule from 'node-schedule';
import * as pauseable from 'pauseable';
import { tip, warn, error, timerLog, mqttLog } from './debug'
import getMAC from 'getmac'

import { VoiceAssistant } from './voice-assistant';

export interface Message {
    fromDevice?: string,
    data: any
}

export interface authOption {
    "authKey"?: string,
    "version"?: string,
    "protocol"?: string,
    "webSocket"?: boolean
}

export class BlinkerDevice {

    options: authOption = {
        version: '1.0',
        protocol: 'mqtts',
        webSocket: true
    };

    mqttClient: mqtt.MqttClient;

    wsServer;
    ws;

    config: {
        broker: string,
        deviceName: string,
        host: string,
        iotId: string,
        iotToken: string,
        port: string,
        productKey: string,
        uuid: string,
        authKey?: string
    };

    subTopic;
    pubTopic;

    deviceName;

    targetDevice;

    dataRead = new Subject<Message>()

    heartbeat = new Subject<Message>()

    realtimeRequest = new Subject<string[]>()

    builtinSwitch = new BuiltinSwitch();

    configReady = new BehaviorSubject(false)

    widgetKeyList = []
    widgetDict = {}

    sharedUserList = []

    private tempData;
    private tempDataPath;

    constructor(authkey = '', options?: authOption) {
        if (authkey == '') {
            authkey = loadJsonFile('.auth.json').authkey
            console.log(authkey);

        }
        for (const key in options) {
            this.options[key] = options[key]
        }
        this.options['authKey'] = authkey
        this.init(authkey)
    }

    init(authkey) {
        axios.get(API.AUTH, { params: this.options }).then(async resp => {
            console.log(resp.data);
            if (resp.data.message != 1000) {
                error(resp.data);
                return
            }
            this.config = resp.data.detail
            this.config['authKey'] = authkey
            if (this.config.broker == 'aliyun') {
                mqttLog('broker:aliyun')
                this.initBroker_Aliyun()
            } else if (this.config.broker == 'blinker') {
                mqttLog('broker:blinker')
                this.initBroker_Blinker()
            }
            await this.connectBroker()
            this.addWidget(this.builtinSwitch)
            this.getShareInfo()
            this.initLocalService()
            // 加载暂存数据  
            this.tempDataPath = `.${this.config.deviceName}.json`
            this.tempData = loadJsonFile(this.tempDataPath)
            this.loadTimingTask()
            this.configReady.next(true)
        })

    }

    ready(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true)
            }, 5000);
        })
    }

    // 本地服务：MDNS\WS SERVER
    initLocalService() {
        if (!this.options.webSocket) return
        // 开启mdns服务
        bonjour().publish({
            name: this.config.deviceName,
            type: 'blinker',
            host: this.config.deviceName + '.local',
            port: 81,
            txt: { mac: getMAC().replace(/:/g, '').toUpperCase() }
        })
        this.wsServer = new WebSocket.Server({ port: 81 });
        this.wsServer.on('connection', ws => {
            tip('local connection');
            ws.send(`{"state":"connected"}`)
            this.ws = ws
            this.ws.on('message', (message) => {
                let data;
                let fromDevice;
                try {
                    data = JSON.parse(message)
                    this.processData(data, fromDevice)
                } catch (error) {
                    console.log(error);
                    console.log(message);
                }
            });
        })
        this.wsServer.on('close', () => {
            console.log('ws client disconnect');
        })
    }

    getShareInfo() {
        axios.get(API.SHARE + `?deviceName=${this.config.deviceName}&key=${this.config.authKey}`).then(resp => {
            if (resp.data.message != 1000) {
                error(resp.data);
                return
            }
            this.sharedUserList = resp.data.detail.users
        })
    }

    exasubTopic;
    exapubTopic;
    initBroker_Aliyun() {
        this.subTopic = `/${this.config.productKey}/${this.config.deviceName}/r`;
        this.pubTopic = `/${this.config.productKey}/${this.config.deviceName}/s`;
        this.exasubTopic = `/sys/${this.config.productKey}/${this.config.deviceName}/rrpc/request/+`
        this.exapubTopic = `/sys/${this.config.productKey}/${this.config.deviceName}/rrpc/response/`
        this.targetDevice = this.config.uuid;
    }

    initBroker_Blinker() {
        this.subTopic = `/device/${this.config.deviceName}/r`;
        this.pubTopic = `/device/${this.config.deviceName}/s`;
        this.targetDevice = this.config.uuid;
    }

    connectBroker() {
        return new Promise((resolve, reject) => {
            this.mqttClient = mqtt.connect(this.config.host + ':' + this.config.port, {
                clientId: this.config.deviceName,
                username: this.config.iotId,
                password: this.config.iotToken
            });

            this.mqttClient.on('connect', () => {
                mqttLog('blinker connected');
                this.mqttClient.subscribe(this.subTopic);
                this.startHeartbeat2cloud();
                resolve(true)
            })

            this.mqttClient.on('message', (topic, message) => {
                if (topic == this.subTopic) {
                    let data;
                    let fromDevice;

                    try {
                        let messageString = u8aToString(message)
                        // console.log(topic);
                        console.log(messageString);

                        let messageObject = JSON.parse(messageString)
                        fromDevice = messageObject.fromDevice
                        data = messageObject.data
                        this.targetDevice = fromDevice
                    } catch (error) {
                        console.log(error);
                    }
                    // 检查
                    if (this.sharedUserList.indexOf(fromDevice) < 0 && fromDevice != this.config.uuid) return
                    this.processData(data, fromDevice)
                }
            })

            this.mqttClient.on('close', (err) => {
                mqttLog('blinker close');
                this.stopHeartbeat2cloud()
            })

            this.mqttClient.on('error', (err) => {
                mqttLog(err);
            })
        })
    }

    // 云端心跳
    timer_heartbeat2cloud;
    startHeartbeat2cloud() {
        axios.get(API.HEARTBEAT + `?deviceName=${this.config.deviceName}&key=${this.config.authKey}&heartbeat=600`)
        this.timer_heartbeat2cloud = setInterval(() => {
            axios.get(API.HEARTBEAT + `?deviceName=${this.config.deviceName}&key=${this.config.authKey}&heartbeat=600`)
        }, 599000)
    }

    stopHeartbeat2cloud() {
        clearInterval(this.timer_heartbeat2cloud)
    }

    processData(data, fromDevice = this.targetDevice) {
        if (typeof data == 'string' || typeof data == 'number') {
            this.dataRead.next({
                fromDevice: fromDevice,
                data: data
            })
            return
        }
        if (typeof data['get'] != 'undefined') {
            if (data['get'] == 'state') {
                this.heartbeat.next(data);
                this.sendMessage(`{"state":"online"}`)
            } else if (data['get'] == 'timing') {
                // tip('反馈定时任务')
                // console.log(this.getTimingData());
                this.sendMessage(this.getTimingData())
            } else if (data['get'] == 'countdown') {
                // tip('反馈倒计时任务')
                this.sendMessage(this.getCountdownData())
            }
        } else if (typeof data['set'] != 'undefined') {
            if (typeof data['set']['timing'] != 'undefined') {
                if (typeof data['set']['timing'][0]["dlt"] != 'undefined') {
                    this.delTimingData(data['set']['timing'][0]["dlt"])
                } else {
                    this.setTimingData(data['set']['timing']);
                }
                this.sendMessage(this.getTimingData())
            } else if (typeof data['set']['countdown'] != 'undefined') {
                // tip('设定倒计时任务')
                this.setCountdownData(data['set']['countdown']);
                this.sendMessage(this.getCountdownData())
            }
        } else if (typeof data['rt'] != 'undefined') {
            this.realtimeRequest.next(data['rt']);
        } else {
            // tip(JSON.stringify(data));
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
    }

    sendTimers = {};

    messageDataCache = {}

    sendMessage(message: string | Object, toDevice = this.targetDevice) {
        // console.log(message);
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
                this.mqttClient.publish(this.pubTopic, formatMess2Device(this.config.deviceName, toDevice, this.messageDataCache[toDevice]))
                this.messageDataCache[toDevice] = '';
                delete this.sendTimers[toDevice];
            }, 100)
        } else {
            console.log('not json');
            if (!isNumber(sendMessage)) sendMessage = `"${sendMessage}"`
            this.mqttClient.publish(this.pubTopic, formatMess2Device(this.config.deviceName, toDevice, sendMessage))
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
        if (this.config.broker != 'blinker') {
            warn('saveTsData:仅可用于blinker broker');
            return
        }
        // console.log(JSON.stringify(this.storageCache));
        clearTimeout(this.tsDataTimer);
        let currentData = Object.assign({ date: Math.floor((new Date).getTime() / 1000) }, data)
        if (this.storageCache.length == 0 || currentData.date - this.storageCache[this.storageCache.length - 1].date >= 5) {
            this.storageCache.push(currentData)
        }
        if (this.storageCache[this.storageCache.length - 1].date - this.storageCache[0].date >= 60 || this.storageCache.length >= 12) {
            this.sendTsData()
        } else
            this.tsDataTimer = setTimeout(() => {
                this.sendTsData()
            }, 60000);
    }

    private sendTsData() {
        let data = JSON.stringify(this.storageCache)
        if (data.length > 10240) {
            error('saveTsData:单次上传数据长度超过10Kb,请减少数据内容，或降低数据上传频率');
            return
        }
        tip('sendTsData')
        this.mqttClient.publish(this.pubTopic, formatMess2StorageTs(this.config.deviceName, 'ts', data))
        this.storageCache = []
    }
    objectDataTimer
    saveObjectData(data: any) {
        if (this.config.broker != 'blinker') {
            warn('saveObjectData:仅可用于blinker broker')
            return
        }
        let dataCache;
        if (typeof data == 'string') {
            if (!isJson(data)) {
                error(`saveObjectData:数据不是对象`)
                return
            } else {
                dataCache = JSON.parse(data)
            }
        } else {
            dataCache = data
        }
        clearTimeout(this.objectDataTimer);
        this.objectDataTimer = setTimeout(() => {
            tip('saveObjectData')
            this.mqttClient.publish(this.pubTopic, formatMess2StorageOt(this.config.deviceName, 'ot', JSON.stringify(dataCache)))
        }, 5000);
    }
    textDataTimer
    saveTextData(data: string) {
        if (this.config.broker != 'blinker') {
            warn('saveTextData:仅可用于blinker broker');
            return
        }
        if (data.length > 1024) {
            error('saveTextData:数据长度超过1024字节');
            return
        }
        clearTimeout(this.textDataTimer);
        this.textDataTimer = setTimeout(() => {
            tip('saveTextData')
            this.mqttClient.publish(this.pubTopic, formatMess2StorageTt(this.config.deviceName, 'tt', data))
        }, 5000);
    }

    addWidget(widget: Widget | any): Widget | any {
        widget.device = this;
        this.widgetKeyList.push(widget.key);
        this.widgetDict[widget.key] = widget;
        return widget
    }

    addVoiceAssistant(voiceAssistant: VoiceAssistant) {
        this.configReady.subscribe(state => {
            if (state) {
                let params = Object.assign({ token: this.config.iotToken }, voiceAssistant.vaType)
                axios.post(API.VOICE_ASSISTANT, params).then(resp => {
                    // console.log(resp);
                    voiceAssistant.device = this;
                    voiceAssistant.listen();
                })
            }
        })
        return voiceAssistant
    }

    vibrate(time = 500) {
        this.sendMessage(`{"vibrate":${time}}`)
    }

    sendSmsTimeout = true;
    sms(text: string) {
        if (!this.sendSmsTimeout) {
            warn('sendSms:too frequent requests')
            return
        }
        this.sendSmsTimeout = false;
        setTimeout(() => {
            this.sendSmsTimeout = true
        }, 60000);
        axios.post(API.SMS, {
            'deviceName': this.config.deviceName,
            'key': this.config.authKey,
            'msg': text
        }).then(resp => {
            if (resp.data.message != 1000)
                error(resp.data);
        })
    }

    wechat(title: string, state: string, text: string) {
        axios.post(API.WECHAT, {
            'deviceName': this.config.deviceName,
            'key': this.config.authKey,
            'title': title,
            'state': state,
            'msg': text
        }).then(resp => {
            if (resp.data.message != 1000)
                error(resp.data);
        })
    }

    push(text: string) {
        axios.post(API.PUSH, {
            'deviceName': this.config.deviceName,
            'key': this.config.authKey,
            'msg': text
        }).then(resp => {
            if (resp.data.message != 1000)
                error(resp.data);
        })
    }

    notice(message) {
        this.sendMessage(`{"notice":"${message}"}`)
    }

    // 定时功能
    timingTasks = [];
    private setTimingData(data) {
        timerLog('set timing task')
        if (typeof this.tempData['timing'] == 'undefined') this.tempData['timing'] = []
        this.tempData['timing'][data[0].task] = data[0]
        this.addTimingTask(data[0])
    }

    private getTimingData() {
        if (typeof this.tempData['timing'] == 'undefined')
            return { timing: [] }
        else
            return { timing: this.tempData['timing'] }
    }

    private delTimingData(taskId) {
        this.delTimingTask(taskId)
        arrayRemove(this.tempData['timing'], taskId)
        for (let index = taskId; index < this.tempData['timing'].length; index++)
            this.tempData['timing'][index].task = index
    }

    private addTimingTask(taskData) {
        // console.log(taskData);
        if (taskData.ena == 0) {
            this.disableTimingTask(taskData.task)
            return
        }
        let hour = Math.floor(taskData.tim / 60);
        let minute = taskData.tim % 60
        let dayOfWeek = []
        for (let index = 0; index < taskData.day.length; index++) {
            if (taskData.day[index] == '1')
                dayOfWeek.push(index)
        }
        let config = {
            minute: minute,
            hour: hour
        }
        if (dayOfWeek.length == 1) {
            config['dayOfWeek'] = dayOfWeek[0]
        } else if (dayOfWeek.length > 1) {
            config['dayOfWeek'] = dayOfWeek
        }
        // console.log(config);
        this.timingTasks[taskData.task] = schedule.scheduleJob(config, () => {
            this.processData(taskData.act[0])
            this.disableTimingTask(taskData.task)
            this.sendMessage(this.getTimingData())
            timerLog('timer task done')
        })
        saveJsonFile(this.tempDataPath, this.tempData)
    }

    private delTimingTask(taskId) {
        this.disableTimingTask(taskId);
        arrayRemove(this.timingTasks, taskId)
        saveJsonFile(this.tempDataPath, this.tempData)
    }

    private disableTimingTask(taskId) {
        this.tempData['timing'][taskId].ena = 0;
        this.timingTasks[taskId].cancel();
        saveJsonFile(this.tempDataPath, this.tempData)
    }

    // 重启后，加载定时配置  
    private loadTimingTask() {
        if (typeof this.tempData['timing'] == 'undefined') return
        timerLog("load timing tasks")
        for (let index = 0; index < this.tempData['timing'].length; index++) {
            const task = this.tempData['timing'][index];
            if (task.ena == 1)
                this.addTimingTask(task)
        }
    }

    // 倒计时功能  
    countdownTimer;
    countdownTimer2;

    setCountdownData(data) {
        if (data == 'dlt') {
            timerLog('countdown stop')
            this.tempData['countdown'] = false
            this.clearCountdownTimer()
            return
        } else if (JSON.stringify(data).indexOf(`{"run":1}`) > -1 || JSON.stringify(data).indexOf(`{"run":0}`) > -1) {
            this.tempData['countdown']['run'] = data.run
            if (this.tempData['countdown']['run'] == 0) {
                timerLog('countdown pause')
                this.countdownTimer.pause()
                this.countdownTimer2.pause()
            } else if (this.tempData['countdown']['run'] == 1) {
                timerLog('countdown resume')
                this.countdownTimer.resume()
                this.countdownTimer2.resume()
            }
            return
        }
        timerLog('countdown start')
        this.tempData['countdown'] = data;
        this.tempData['countdown']['rtim'] = 0
        this.clearCountdownTimer();
        this.countdownTimer = pauseable.setTimeout(() => {
            this.clearCountdownTimer();
            timerLog('countdown done')
            this.processData(this.tempData['countdown'].act[0]);
            // 关闭倒计时
            this.tempData['countdown'] = false
            this.sendMessage(this.getCountdownData())
        }, data.ttim * 60 * 1000);
        this.countdownTimer2 = pauseable.setInterval(() => {
            this.tempData['countdown']['rtim']++;
            if (this.tempData['countdown']['rtim'] == this.tempData['countdown']['ttim']) clearInterval(this.countdownTimer2)
        }, 60 * 1000)
    }

    clearCountdownTimer() {
        if (typeof this.countdownTimer != 'undefined')
            this.countdownTimer.clear()
        if (typeof this.countdownTimer != 'undefined')
            this.countdownTimer2.clear()
    }

    getCountdownData() {
        if (typeof this.tempData['countdown'] == 'undefined')
            return { countdown: false }
        else
            return { countdown: this.tempData['countdown'] }
    }

    // 气象数据获取  
    getWeather(cityCode = null) {
        let params = {
            device: this.config.deviceName,
            key: this.config.iotToken
        }
        if (cityCode != null) {
            params['code'] = cityCode
        }
        return axios.get(API.WEATHER, {
            params: params
        }).then((resp) => {
            if (resp.data.message == 1000)
                return resp.data.detail
            else {
                error('getWeather 超出限制')
                return
            }
        })
    }

    getWeatherForecast(cityCode = null) {
        let params = {
            device: this.config.deviceName,
            key: this.config.iotToken
        }
        if (cityCode != null) {
            params['code'] = cityCode
        }
        return axios.get(API.WEATHER_FORECAST, {
            params: params
        }).then((resp) => {
            if (resp.data.message == 1000)
                return resp.data.detail
            else {
                error('getWeatherForecast 超出限制')
                return
            }
        })
    }

    getAir(cityCode = null) {
        let params = {
            device: this.config.deviceName,
            key: this.config.iotToken
        }
        if (cityCode != null) {
            params['code'] = cityCode
        }
        return axios.get(API.AIR, {
            params: params
        }
        ).then((resp) => {
            if (resp.data.message == 1000)
                return resp.data.detail
            else {
                error('getAir 超出限制')
                return
            }
        })
    }

    log(logString) {
        return axios.post(API.LOG, {
            token: this.config.iotToken,
            data: [[(new Date()).getTime().toString().substr(0, 10), logString]]
        }).then((resp: any) => {
            if (resp.data.message == 1000)
                tip('log2Cloud')
            return resp.data
        })
    }

    setPosition(lng, lat) {
        return axios.post(API.POSITION, {
            token: this.config.iotToken,
            data: [[(new Date()).getTime().toString().substr(0, 10), [lng, lat]]]
        }).then((resp: any) => {
            if (resp.data.message == 1000)
                tip('position2Cloud')
            return resp.data
        })
    }

    // 实时数据传输功能
    realtimeTasks = {}
    sendRtData(key: string, func: Function, time = 1000) {
        if (typeof this.realtimeTasks[key] != 'undefined') this.realtimeTasks[key].cancel()
        this.realtimeTasks[key] = schedule.scheduleJob(
            {
                end: Date.now() + 10000,
                rule: `*/${time / 1000} * * * * *`
            }, () => {
                let message = `{"${key}":{"val":${func()},"date":${Math.round(new Date().getTime() / 1000)}}}`
                this.sendMessage(message)
            })
    }
}

// 内置开关
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
    // 兼容阿里broker保留deviceType和fromDevice  
    return `{"deviceType":"OwnApp","data":${data},"fromDevice":"${deviceId}","toDevice":"${toDevice}"}`
}

function formatMess2Grounp(deviceId, toGrounp, data) {
    return `{"data":${data},"fromDevice":"${deviceId}","toGrounp":"${toGrounp}"}`
}

function formatMess2StorageTs(deviceId, storageType, data) {
    return `{"data":${data},"fromDevice":"${deviceId}","toStorage":"${storageType}"}`
}

function formatMess2StorageTt(deviceId, storageType, data) {
    return `{"data":"${data}","fromDevice":"${deviceId}","toStorage":"${storageType}"}`
}

function formatMess2StorageOt(deviceId, storageType, data) {
    return `{"data":${data},"fromDevice":"${deviceId}","toStorage":"${storageType}"}`
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


import * as fs from 'fs';
import { API, SERVER } from './server.config';
import { clearInterval } from 'timers';
import { u8aToString } from './fun';

function loadJsonFile(path) {
    if (fs.existsSync(path))
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    else
        return {}
}

function saveJsonFile(path, data) {
    fs.writeFileSync(path, JSON.stringify(data));
}

function arrayRemove(array, index) {
    if (index <= (array.length - 1)) {
        for (var i = index; i < array.length; i++) {
            array[i] = array[i + 1];
        }
    }
    else {
        // throw new Error('超出最大索引！');
    }
    array.length = array.length - 1;
    return array;
}