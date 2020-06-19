import { Device } from './blinker';
import { ButtonWidget } from './widget';

let device = new Device('c8df42c8acbc');
let button1 = device.addWidget(new ButtonWidget('btn-crf'));
let button2 = device.addWidget(new ButtonWidget('btn-b9g'));
device.subject_dataRead.subscribe(message => {
    console.log('otherData:', message);
})

device.subject_heartbeat.subscribe(message => {
    console.log('heartbeat:',message);
})

device.subject_builtinSwitch.subscribe(message => {
    console.log('builtinSwitch:',message);
})

button1.change.subscribe(message => {
    console.log('button1:', message);
})

button2.change.subscribe(message => {
    console.log('button2:', message);
})



