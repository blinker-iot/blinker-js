import { BlinkerDevice } from '../lib/blinker';
import { ButtonWidget, NumberWidget } from '../lib/widget';

let device = new BlinkerDevice(/*您申请到的Secret Key*/);

// 注册组件
let button1: ButtonWidget = device.addWidget(new ButtonWidget('btn-123'));
let button2: ButtonWidget = device.addWidget(new ButtonWidget('btn-abc'));
let number1: NumberWidget = device.addWidget(new NumberWidget('num-abc'));

let num = 0;

device.ready().then(() => {
    device.dataRead.subscribe(message => {
        console.log('otherData:', message);
    })

    button1.listen().subscribe(message => {
        console.log('button1:', message.data);
        num++;
        number1.value(num).update();
    })

    button2.listen().subscribe(message => {
        console.log('button2:', message.data);
        // 其他控制代码
    })

})