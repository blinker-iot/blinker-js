import { BlinkerDevice } from './lib/blinker';
import { ButtonWidget, TextWidget, RangeWidget, NumberWidget, RGBWidget, JoystickWidget, ChartWidget } from './lib/widget';
// import { CONFIG } from './config';

let device = new BlinkerDevice(/*您申请到的authkey*/);

// 注册组件
let button1: ButtonWidget = device.addWidget(new ButtonWidget('btn-crf'));
let button2: ButtonWidget = device.addWidget(new ButtonWidget('btn-b9g'));
let text1: TextWidget = device.addWidget(new TextWidget('tex-pnd'));
let range1: RangeWidget = device.addWidget(new RangeWidget('ran-i89'));
let number1: NumberWidget = device.addWidget(new NumberWidget('num-lnw'));
let colorPicker1: RGBWidget = device.addWidget(new RGBWidget('col-a9t'));
let joystick1: JoystickWidget = device.addWidget(new JoystickWidget('joy-d32'));
let chart1: ChartWidget = device.addWidget(new ChartWidget('crt-001'));

device.dataRead.subscribe(message => {
    console.log('otherData:', message);
})

device.heartbeat.subscribe(message => {
    console.log('heartbeat:', message);
    device.builtinSwitch.setState(getSwitchState()).update();
    range1.value(randomNumber()).color(randomColor()).update();
    number1.value(randomNumber()).unit('米').text('长度').color(randomColor()).update();
    button2.color(randomColor()).update();
    button1.color(randomColor()).update();
    colorPicker1.color(randomColor()).brightness(randomNumber(0, 255)).update()
    device.vibrate();
})

device.builtinSwitch.change.subscribe(message => {
    console.log('builtinSwitch:', message);
    device.builtinSwitch.setState(turnSwitch()).update();
})

button1.listen().subscribe(message => {
    console.log('button1:', message.data);
    button1.turn(turnSwitch()).update();
    text1.text('button1的动作').text1(message.data).update();
})

button2.listen().subscribe(message => {
    console.log('button2:', message);
    text1.text('button2的动作').text1(message.data).update();
})

range1.listen().subscribe(message => {
    console.log('range:', message.data);
})

colorPicker1.listen().subscribe(message => {
    console.log('color:', message.data);
    console.log('red:', message.data[0]);
    console.log('green:', message.data[1]);
    console.log('blue:', message.data[2]);
    console.log('brightness:', message.data[3]);
})

joystick1.listen().subscribe(message => {
    console.log('joystick:', message.data);
    console.log('x:', message.data[0]);
    console.log('y:', message.data[1]);
})

// 存储时序数据
setInterval(() => {
    device.saveTsData({
        humi: randomNumber(),
        temp: randomNumber(),
        pm25: randomNumber(),
        pm10: randomNumber()
    });
}, 5000)

// 存储文本数据、对象数据
setTimeout(() => {
    device.saveTextData('text');
    device.saveObjectData({
        config: 111,
        test: 'text'
    });
}, 60000);

// 实时图表数据
setInterval(() => {
    chart1.push({
        key:'humi',
        value:20,
        date:new Date()
    });
}, 5000)

// 空气、天气、天气预报 获取
setTimeout(async () => {
    console.log(await device.getAir('sichuan-chengdushi'));
    console.log(await device.getWeather('sichuan-chengdushi'));
    console.log(await device.getWeatherForecast('sichuan-chengdushi'));
}, 10000);


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
function getSwitchState() {
    return switchState ? 'on' : 'off'
}
let switchState = false
function turnSwitch() {
    switchState = !switchState
    return switchState ? 'on' : 'off'
}
