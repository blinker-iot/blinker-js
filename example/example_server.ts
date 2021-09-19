import { BlinkerDevice } from '../lib/blinker';
import { NumberWidget } from '../lib/widget';
import * as os from 'os';
import fs from 'fs';
import * as osUtils from 'os-utils';
import { diskinfo } from '@dropb/diskinfo';

let state: any = {}
let platform = os.platform();

let device = new BlinkerDevice('',{
    webSocket:false
});

let number1: NumberWidget = device.addWidget(new NumberWidget('cpu'));
let number2: NumberWidget = device.addWidget(new NumberWidget('mem'));


device.ready().then(() => {
    
    device.heartbeat.subscribe(message => {
        console.log('heartbeat:', message);
        number1.value(state.cpuUsage * 100).update();
        number2.value(state.memUsage * 100).update();
        device.builtinSwitch.setState('on').update();
    })

    setInterval(async () => {
        await getInfo()
        console.log('state', state);
        device.saveTsData({
            cpu: state.cpuUsage,
            mem: state.memUsage
        });
    }, 5000)


    async function getInfo() {
        if (platform == 'linux') {
            let meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
            let itemArray = meminfo.split('\n');
            let memAvailable = parseInt(itemArray[2].replace(/[^0-9]/g, ""));
            let memTotle = parseInt(itemArray[0].replace(/[^0-9]/g, ""));
            let memUsage = 1 - (memAvailable / memTotle);
            addData('memAvailable', memAvailable);
            addData('memTotle', memTotle);
            addData('memUsage', memUsage);
        } else {
            addData('memAvailable', osUtils.freemem());
            addData('memTotle', osUtils.totalmem());
            addData('memUsage', osUtils.freememPercentage());
        }
        addData('cpuUsage', await getCpuUsage())
        addData('cpuFree', await getCpuFree())
        addData('cpuCount', osUtils.cpuCount())
        addData('average', [osUtils.loadavg(1), osUtils.loadavg(5), osUtils.loadavg(15)])
        await getDiskinfo()
    }
})

async function getDiskinfo() {
    let diskData = await diskinfo('./');
    addData('diskTotle', diskData.size)
    addData('diskUsed', diskData.used)
    addData('diskAvailable', diskData.avail)
}

function getCpuUsage() {
    return new Promise((reslove, reject) => {
        osUtils.cpuUsage(value => {
            reslove(value)
        })
    })
}

function getCpuFree() {
    return new Promise((reslove, reject) => {
        osUtils.cpuFree(value => {
            reslove(value)
        })
    })
}

function addData(key, value) {
    state[key] = value
}