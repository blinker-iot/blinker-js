import { BlinkerDevice } from '../../lib/blinker';
import { AliGenie, VA_TYPE } from '../../lib/voice-assistant';

let device = new BlinkerDevice('');

let aliGenie = device.addVoiceAssistant(new AliGenie(VA_TYPE.OUTLET));

device.ready().then(() => {
    // 电源状态改变
    aliGenie.powerChange.subscribe(message => {
        // console.log(message.data);
        switch (message.data.set.pState) {
            case 'on':
                message.power('on').update();
                break;
            case 'off':
                message.power('off').update();
                break;
            default:
                break;
        }
    })

    aliGenie.stateQuery.subscribe(message => {
        message.power('on').update();
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
