import getMAC from 'getmac'
import * as qrcode from 'qrcode-terminal'
import axios from 'axios';
import mqtt from 'mqtt';

const API_Register = "";
const API_RegisterCheck = ""


const { program } = require('commander');

program
    .option('--no-sauce', 'Remove sauce')
    .option('--cheese <flavour>', 'cheese flavour', 'mozzarella')
    .option('--no-cheese', 'plain with no cheese')


program
    .command('start <service>', 'start named service')
    .command('stop [service]', 'stop named service, or all if no name supplied')
    .parse(process.argv);


program.on('--help', () => {
    console.log('');
    console.log('Example call:');
    console.log('  $ custom-help --help');
});

function createConfig() {

}

function readConfig() {

}

function register() {
    axios.get(API_Register).then(resp => {
        if (resp.data.message == 1000) {
            showQrcode(resp.data.detail);
            let times = 0;
            let timer = setInterval(() => {
                times++;
                if (times > 10) {
                    clearInterval(timer);
                    console.log("设备注册超时");
                    return
                }
                if (checkRegister()) {
                    clearInterval(timer);
                    console.log("设备注册成功");
                }
            }, 6000)
        }
    })
}

function checkRegister() {
    return axios.get(API_RegisterCheck).then(resp => {
        if (resp.data.message == 1000) {
            return true
        } else
            return false
    })
}

function getMacAddr() {
    return getMAC().replace(/:/g, '')
}

function showQrcode(str: string) {
    qrcode.setErrorLevel('Q');
    qrcode.generate(str);
}


console.log(getMacAddr());
showQrcode(getMacAddr())