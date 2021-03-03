import { BlinkerDevice } from '../../lib/blinker';
import { Miot, VA_TYPE } from '../../lib/voice-assistant';

let device = new BlinkerDevice('');

let miot = device.addVoiceAssistant(new Miot(VA_TYPE.SENSOR));

device.ready().then(() => {
    // 查询传感器状态   
    miot.stateQuery.subscribe(message => {
        // console.log(message.data);
        switch (message.data.get) {
            case 'aqi':
                message.aqi(10).update();
                break;
            case 'pm25':
                message.pm25(10).update();
                break;
            case 'pm10':
                message.pm10(10).update();
                break;
            case 'co2':
                message.co2(10).update();
                break;
            case 'humi':
                message.humi(10).update();
                break;
            case 'temp':
                message.temp(10).update();
                break;
            default:
                break;
        }
    })

    device.dataRead.subscribe(message => {
        console.log('otherData:', message);
    })

    device.builtinSwitch.change.subscribe(message => {
        console.log('builtinSwitch:', message);
        device.builtinSwitch.setState(turnSwitch()).update();
    })

})


/*
以下为测试用函数
*/

let switchState = false
function turnSwitch() {
    switchState = !switchState
    device.log("切换设备状态为" + (switchState ? 'on' : 'off'))
    return switchState ? 'on' : 'off'
}
