import { BlinkerDevice } from './blinker';
import { ButtonWidget, TextWidget, RangeWidget, NumberWidget, RGBWidget, JoystickWidget } from './widget';

let device = new BlinkerDevice('749ab6b86e57');

let button1 = device.addWidget(new ButtonWidget('btn-crf'));
let button2 = device.addWidget(new ButtonWidget('btn-b9g'));
let text1 = device.addWidget(new TextWidget('tex-pnd'));
let range1 = device.addWidget(new RangeWidget('ran-i89'));
let number1 = device.addWidget(new NumberWidget('num-lnw'));
let colorPicker1 = device.addWidget(new RGBWidget('col-a9t'));
let joystick1 = device.addWidget(new JoystickWidget('joy-d32'));

let powerState = 'off';

device.dataRead.subscribe(message => {
    console.log('otherData:', message);
})

device.heartbeat.subscribe(message => {
    console.log('heartbeat:', message);
    device.builtinSwitch.setState(powerState).update();
    range1.value(randomNumber()).color(randomColor()).update();
    number1.value(randomNumber()).unit('米').text('长度').color(randomColor()).update();
    button2.color(randomColor()).update();
    button1.color(randomColor()).update();
    colorPicker1.color(randomColor()).brightness(randomNumber(0, 255)).update()
})

device.builtinSwitch.stateChange.subscribe(state => {
    console.log('builtinSwitch:', state);
    device.builtinSwitch.setState(powerState).update();
})

button1.stateChange.subscribe(action => {
    console.log('button1:', action);
    button1.turn(turnSwitch()).update();
    text1.text('button1的动作').text1(action).update();
})

button2.stateChange.subscribe(action => {
    console.log('button2:', action);
    text1.text('button2的动作').text1(action).update();
})

range1.stateChange.subscribe(value => {
    console.log('range:', value);
})

colorPicker1.stateChange.subscribe(value => {
    console.log('color:', value);
    console.log('red:', value[0]);
    console.log('green:', value[1]);
    console.log('blue:', value[2]);
    console.log('brightness:', value[3]);
})

joystick1.stateChange.subscribe(value => {
    console.log('joystick:', value);
    console.log('x:', value[0]);
    console.log('y:', value[1]);
})


/*
以下为测试用函数
*/
// 随机数
function randomNumber(min = 0, max = 100) {
    let random = Math.random()
    return Math.floor((min + (max - min) * random))
}

// 随机颜色
function randomColor() {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var color = '#' + r.toString(16) + g.toString(16) + b.toString(16);
    return color;
}

// 开关切换
let switchState = false
function turnSwitch() {
    switchState = !switchState
    return switchState ? 'on' : 'off'
}
