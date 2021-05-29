import { BlinkerDevice } from '../lib/blinker';
import { ButtonWidget, TextWidget, RangeWidget, NumberWidget, RGBWidget, JoystickWidget, ChartWidget, ImageWidget } from '../lib/widget';

let device = new BlinkerDevice(/*您申请到的authkey*/);

// 注册组件
let button: ButtonWidget = device.addWidget(new ButtonWidget('btn-crf'));
let chart1: ChartWidget = device.addWidget(new JoystickWidget('cha-t12'));


device.ready().then(() => {

    device.dataRead.subscribe(message => {
        console.log('otherData:', message);
    })

    button.listen().subscribe(message => {
        console.log('button1:', message.data);

    })


    chart1.listen().subscribe(message => {
        console.log('chart:', message.data);
        switch (message.data.get) {
            case 'humi':
                device.sendRtData('humi', randomNumber)
                break;
            case 'temp':
                device.sendRtData('temp', randomNumber)
                break;
            default:
                break;
        }
        // device.sendRtData({
        //     humi: randomNumber,
        //     temp: randomNumber
        // }, 1000)
    })

    // 云存储时序数据  仅限blinker broker
    // setInterval(() => {
    //     device.saveTsData({
    //         humi: randomNumber(),
    //         temp: randomNumber(),
    //         pm25: randomNumber(),
    //         pm10: randomNumber()
    //     });
    // }, 5000)

})




/*
以下为测试用函数
*/
// 随机数
function randomNumber(min = 0, max = 100) {
    let random = Math.random()
    return Math.floor((min + (max - min) * random))
}