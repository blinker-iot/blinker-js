(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    // import { connect } from 'mqtt';
    // import axios from './node_modules/axios';
    var axios = require('axios');
    var mqtt = require('mqtt');
    var host = 'https://iot.diandeng.tech';
    var url = host + '/api/v1/user/device/diy/auth?authKey=';
    var Device = /** @class */ (function () {
        function Device(authkey) {
            this.init(authkey);
        }
        Device.prototype.init = function (authkey) {
            var _this = this;
            axios.get(url + authkey).then(function (resp) {
                console.log(resp.data);
                _this.config = resp.data.detail;
                _this.connectBroker();
            });
        };
        Device.prototype.connectBroker = function () {
            var _this = this;
            if (this.config.broker == 'aliyun') {
                this.host = 'public.iot-as-mqtt.cn-shanghai.aliyuncs.com';
                this.port = 1883;
                this.subtopic = '/' + this.config.productKey + '/' + this.config.deviceName + '/r';
                this.pubtopic = '/' + this.config.productKey + '/' + this.config.deviceName + '/s';
                this.clientId = this.config.deviceName;
                this.username = this.config.iotId;
                this.deviceName = this.config.deviceName;
                this.password = this.config.iotToken;
                this.uuid = this.config.uuid;
            }
            this.mqttClient = mqtt.connect('mqtt://' + this.host + ':' + this.port, {
                clientId: this.clientId,
                username: this.username,
                password: this.password
            });
            this.mqttClient.on('connect', function () {
                _this.mqttClient.subscribe(_this.subtopic);
                console.log('blinker connected');
            });
            this.mqttClient.on('message', function (topic, message) {
                var data;
                var fromDevice;
                try {
                    fromDevice = JSON.parse(u8aToString(message)).fromDevice;
                    data = JSON.parse(u8aToString(message)).data;
                }
                catch (error) {
                    console.log(error);
                }
                console.log(data);
                if (JSON.stringify(data) == '{"get":"state"}') {
                    console.log(format(_this.clientId, fromDevice, "{'state':'online'}"));
                    _this.mqttClient.publish(_this.pubtopic, format(_this.clientId, fromDevice, "{\"state\":\"online\"}"));
                }
            });
            this.mqttClient.on('error', function (err) {
                console.log(err);
            });
        };
        return Device;
    }());
    exports.Device = Device;
    function format(deviceId, toDevice, data) {
        return "{\"deviceType\":\"OwnApp\",\"data\":" + data + ",\"fromDevice\":\"" + deviceId + "\",\"toDevice\":\"" + toDevice + "\"}";
    }
    function u8aToString(fileData) {
        var dataString = "";
        for (var i = 0; i < fileData.length; i++) {
            dataString += String.fromCharCode(fileData[i]);
        }
        return dataString;
    }
});
