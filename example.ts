import { BlinkerDevice } from './blinker';
import { ButtonWidget, TextWidget } from './widget';

let device = new BlinkerDevice('authkey');
let button1 = device.addWidget(new ButtonWidget('btn-crf'));
let button2 = device.addWidget(new ButtonWidget('btn-b9g'));
let text1 = device.addWidget(new TextWidget('tex-pnd'));

device.dataRead.subscribe(message => {
    console.log('otherData:', message);
})

device.heartbeat.subscribe(message => {
    console.log('heartbeat:', message);
})

device.builtinSwitch.subscribe(message => {
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



