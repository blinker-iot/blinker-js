import { BlinkerDevice } from '../lib/blinker';
import { ButtonWidget, TextWidget, RangeWidget, NumberWidget, RGBWidget, JoystickWidget, ChartWidget, ImageWidget } from '../lib/widget';

let device = new BlinkerDevice('', // 设备authkey
    {
        protocol: 'mqtts', // 默认mqtts加密通信，可选配置mqtt\mqtts
        webSocket: true,   // 默认开启websocket，会占用81端口，使用false可关闭
    });

// 注册组件
let button1: ButtonWidget = device.addWidget(new ButtonWidget('btn-crf'));
let button2: ButtonWidget = device.addWidget(new ButtonWidget('btn-b9g'));
let text1: TextWidget = device.addWidget(new TextWidget('tex-pnd'));
let range1: RangeWidget = device.addWidget(new RangeWidget('ran-i89'));
let number1: NumberWidget = device.addWidget(new NumberWidget('num-lnw'));
let colorPicker1: RGBWidget = device.addWidget(new RGBWidget('col-a9t'));
let joystick1: JoystickWidget = device.addWidget(new JoystickWidget('joy-d32'));
let chart1: ChartWidget = device.addWidget(new JoystickWidget('cha-t12'));
let image1: ImageWidget = device.addWidget(new ImageWidget('img-abc'));


device.ready().then(() => {

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
        let state = turnSwitch()
        device.builtinSwitch.setState(state).update();
        device.notice('blinker state:' + state)
    })

    button1.listen().subscribe(message => {
        console.log('button1:', message.data);
        device.push('blinker push');
        let state = turnSwitch()
        button1.turn(state).update();
        text1.text('button1 actions').text1(message.data).update();
        if (state == 'on')
            image1.show(1).update()
        else
            image1.show(0).update()
    })

    button2.listen().subscribe(message => {
        console.log('button2:', message);
        device.sms('短信功能测试');
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


    chart1.listen().subscribe(message => {
        console.log('chart:', message.data);
    })

    // 云存储时序数据  仅限blinker broker
    setInterval(() => {
        device.saveTsData({
            humi: randomNumber(),
            temp: randomNumber(),
            pm25: randomNumber(),
            pm10: randomNumber()
        });
    }, 5000)

    // 云存储文本数据、云存储对象数据  仅限blinker broker
    setTimeout(() => {
        device.saveTextData('text');
        device.saveObjectData({
            config: 111,
            test: 'text'
        });
    }, 60000);

    // 空气、天气、天气预报 获取
    setTimeout(async () => {
        console.log("获取天气数据：");
        console.log(await device.getAir(510100));
        console.log(await device.getWeather(510100));
        console.log(await device.getWeatherForecast(510100));
    }, 10000);

    setTimeout(() => {
        device.wechat('设备测试', '启动', new Date().toString())
        device.push('设备测试：启动')
        setInterval(() => {
            device.wechat('设备测试', '正常运行', new Date().toString())
            device.push('设备测试：正常运行')
        }, 86400000)
    }, 10000);

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
function getSwitchState() {
    return switchState ? 'on' : 'off'
}
let switchState = false
function turnSwitch() {
    switchState = !switchState
    device.log("切换设备状态为" + (switchState ? 'on' : 'off'))
    return switchState ? 'on' : 'off'
}
