import { BlinkerDevice } from './blinker';
import { ButtonWidget, TextWidget, RangeWidget } from './widget';

let device = new BlinkerDevice('c8df42c8acbc');
let button1 = device.addWidget(new ButtonWidget('btn-crf'));
let button2 = device.addWidget(new ButtonWidget('btn-b9g'));
let text1 = device.addWidget(new TextWidget('tex-pnd'));
let range1 = device.addWidget(new RangeWidget('ran-2qv'));

let powerState = 'off';

device.dataRead.subscribe(message => {
    console.log('otherData:', message);
})

device.heartbeat.subscribe(message => {
    console.log('heartbeat:', message);
    device.builtinSwitch.setState(powerState).update();
})

device.builtinSwitch.stateChange.subscribe(state => {
    console.log('builtinSwitch:', state);
    device.builtinSwitch.setState(powerState).update();
})

button1.stateChange.subscribe(action => {
    console.log('button1:', action);
    text1.text('button1的动作').text1(action).update();
})

button2.stateChange.subscribe(action => {
    console.log('button2:', action);
    text1.text('button2的动作').text1(action).update();
})

range1.stateChange.subscribe(value => {
    console.log('range:', value);
})



