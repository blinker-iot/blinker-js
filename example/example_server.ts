import { BlinkerDevice } from '../lib/blinker';
import { ButtonWidget, TextWidget, RangeWidget, NumberWidget, RGBWidget, JoystickWidget, ChartWidget, ImageWidget } from '../lib/widget';
import * as os from 'os';
import fs from 'fs';
import * as osUtils from 'os-utils';
import { diskinfo } from '@dropb/diskinfo';

let state: any = {}
let platform = os.platform();

let device = new BlinkerDevice(/*您申请到的authkey*/);

device.heartbeat.subscribe(message => {
    console.log('heartbeat:', message);
    // device.builtinSwitch.setState(getSwitchState()).update();
    device.sendMessage(state)
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
        let memAvailable = itemArray[2].replace(/[^0-9]/g, "");
        let memTotle = itemArray[0].replace(/[^0-9]/g, "");
        addData('memAvailable', memAvailable);
        addData('memTotle', memTotle);
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