import { Device } from './blinker';
import { ButtonWidget, TextWidget } from './widget';

let device = new Device('c8df42c8acbc');
let button1 = device.addWidget(new ButtonWidget('btn-crf'));
let button2 = device.addWidget(new ButtonWidget('btn-b9g'));
let text1 = device.addWidget(new TextWidget('tex-pnd'));

device.subject_dataRead.subscribe(message => {
    console.log('otherData:', message);
})

device.subject_heartbeat.subscribe(message => {
    console.log('heartbeat:', message);
})

device.subject_builtinSwitch.subscribe(message => {
    console.log('builtinSwitch:', message);
})

button1.stateChange.subscribe(action => {
    console.log('button1:', action);
    text1.text('button1的动作').text1(action).update();
})

button2.stateChange.subscribe(action => {
    console.log('button2:', action);
    text1.text('button2的动作').text1(action).update();
})



