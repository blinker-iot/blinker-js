import { BlinkerDevice } from '../../lib/blinker';
import { DuerOS, VA_TYPE, DUER_LIGHT_MODE } from '../../lib/voice-assistant';

let device = new BlinkerDevice('');

let duerOS = device.addVoiceAssistant(new DuerOS(VA_TYPE.LIGHT));

device.ready().then(() => {
    // 电源状态改变   适用于灯和插座
    duerOS.powerChange.subscribe(message => {
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
    // 模式改变   适用于灯和插座
    duerOS.modeChange.subscribe(message => {
        // console.log(message.data);
        switch (message.data.set.mode) {
            case DUER_LIGHT_MODE.READING:
                break;
            case DUER_LIGHT_MODE.SLEEP:

                break;
            case DUER_LIGHT_MODE.ALARM:

                break;
            case DUER_LIGHT_MODE.NIGHT_LIGHT:

                break;
            case DUER_LIGHT_MODE.ROMANTIC:

                break;
            case DUER_LIGHT_MODE.SUNDOWN:

                break;
            case DUER_LIGHT_MODE.SUNRISE:

                break;
            case DUER_LIGHT_MODE.RELAX:

                break;
            case DUER_LIGHT_MODE.LIGHTING:

                break;
            case DUER_LIGHT_MODE.SUN:

                break;
            case DUER_LIGHT_MODE.STAR:

                break;
            case DUER_LIGHT_MODE.MOON:

                break;
            case DUER_LIGHT_MODE.ENERGY_SAVING:

                break;
            case DUER_LIGHT_MODE.JUDI:

                break;
            default:
                break;
        }
        message.mode(message.data.set.mode).update();
    })

    // 颜色改变   适用于灯
    duerOS.colorChange.subscribe(message => {
        console.log('RGB:',int2rgb(Number(message.data.set.col)));
        message.color(message.data.set.col).update();
    })

    // 色温改变   适用于灯  
    // duerOS.colorTempChange.subscribe(message => {
    //     console.log(message);
    //     message.colorTemp(100).update();
    // })

    // 亮度改变   适用于灯
    let brightness = 50;
    duerOS.brightnessChange.subscribe(message => {
        // console.log(message.data.set);
        if (typeof message.data.set.bright != 'undefined') {
            brightness = Number(message.data.set.bright)
        } else if (typeof message.data.set.upBright != 'undefined') {
            brightness = brightness + Number(message.data.set.upBright)
        } else if (typeof message.data.set.downBright != 'undefined') {
            brightness = brightness - Number(message.data.set.downBright)
        }
        message.brightness(brightness).update();
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

function rgb2int(r: number, g: number, b: number) {
    return ((0xFF << 24) | (r << 16) | (g << 8) | b)
}

function int2rgb(value: number) {
    let r = (value & 0xff0000) >> 16;
    let g = (value & 0xff00) >> 8;
    let b = (value & 0xff);
    return [r, g, b]
}

let switchState = false
function turnSwitch() {
    switchState = !switchState
    device.log("切换设备状态为" + (switchState ? 'on' : 'off'))
    return switchState ? 'on' : 'off'
}
