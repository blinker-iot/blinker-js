import * as os from 'os-utils';
import fs from 'fs';
import { diskinfo } from '@dropb/diskinfo';

async function sendBaseinfo() {
    state.uptime = new Date().getTime() - state.starttime;
    if (platform == 'linux') {
        let meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
        let itemArray = meminfo.split('\n');
        let memAvailable = itemArray[2].replace(/[^0-9]/g, "");
        let memTotle = itemArray[0].replace(/[^0-9]/g, "");
        pubMessage('memory', `${memAvailable},${memTotle}`);
    }
    pubMessage('uptime', state.uptime)
    pubMessage('clients', state.connectedClients)
    // pubMessage('clients/maximum', state.maxConnectedClients)
    pubMessage('sent', state.publishedMessages)
    pubMessage('cpu', `${await getCpuUsage()},${os.cpuCount()}`)
    pubMessage('average', `${os.loadavg(1)},${os.loadavg(5)},${os.loadavg(15)}`)
}

async function sendMoreinfo() {
    let diskData = await diskinfo('./');
    pubMessage('disk', `${diskData.used},${diskData.avail}`)
}

function getCpuUsage() {
    return new Promise((reslove, reject) => {
        os.cpuUsage(value => {
            reslove(value)
        })
    })
}