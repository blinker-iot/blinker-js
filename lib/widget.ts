import { Subject } from "rxjs";
import { BlinkerDevice, Message } from "./blinker";

export class Widget {
    device: BlinkerDevice;
    key: string;
    state = {};

    change = new Subject<Message>();
    private change2 = new Subject<Message>();
    changeSubscription;
    
    constructor(key) {
        this.key = key
    }

    listen() {
        this.changeSubscription = this.change.subscribe(message => {
            this.device.targetDevice = message.fromDevice
            this.change2.next(message)
        })
        return this.change2
    }

    unlisten() {
        this.changeSubscription.unsubscribe();
    }

    update(value = '') {
        let message = {}
        message[this.key] = this.state
        this.device.sendMessage(message)
    }
}

export class ButtonWidget extends Widget {
    constructor(key) {
        super(key)
    }

    turn(swi) {
        this.state['swi'] = swi
        return this
    }

    text(text) {
        this.state['tex'] = text
        return this
    }

    icon(icon) {
        this.state['ico'] = icon
        return this
    }

    color(color) {
        this.state['clr'] = color
        return this
    }
}

export class TextWidget extends Widget {

    constructor(key) {
        super(key)
    }

    text(text) {
        this.state['tex'] = text
        return this
    }

    text1(text) {
        this.state['tex1'] = text
        return this
    }

    icon(icon) {
        this.state['ico'] = icon
        return this
    }

    color(color) {
        this.state['clr'] = color
        return this
    }
}

export class NumberWidget extends Widget {

    constructor(key) {
        super(key)
    }

    text(text) {
        this.state['tex'] = text
        return this
    }

    value(value) {
        this.state['val'] = value
        return this
    }

    unit(unit) {
        this.state['uni'] = unit
        return this
    }

    icon(icon) {
        this.state['ico'] = icon
        return this
    }

    color(color) {
        this.state['clr'] = color
        return this
    }

    max(max) {
        this.state['max'] = max
        return this
    }
}

export class RangeWidget extends Widget {

    constructor(key) {
        super(key)
    }

    text(text) {
        this.state['tex'] = text
        return this
    }

    value(value) {
        this.state['val'] = value
        return this
    }

    unit(unit) {
        this.state['uni'] = unit
        return this
    }

    icon(icon) {
        this.state['ico'] = icon
        return this
    }

    color(color) {
        this.state['clr'] = color
        return this
    }

    max(max) {
        this.state['max'] = max
        return this
    }
}

export class RGBWidget extends Widget {

    constructor(key) {
        super(key)
    }

    text(text) {
        this.state['tex'] = text
        return this
    }

    color(color) {
        if (typeof color == 'string' && color.indexOf('#') == 0)
            this.state = this.toRgb(color)
        else if (color.length == 3 || color.length == 4)
            this.state = color
        return this
    }

    brightness(brightness) {
        this.state[3] = brightness
        return this
    }

    private toRgb(colorHex) {
        let colorStr = colorHex.toLowerCase()
        var colorArray = []
        for (let i = 1; i < 7; i += 2) {
            colorArray.push(parseInt('0x' + colorStr.slice(i, i + 2)))
        }
        return colorArray
    }
}

export class JoystickWidget extends Widget {

    constructor(key) {
        super(key)
    }
}

export class ImageWidget extends Widget {

    constructor(key) {
        super(key)
    }

    show(img: number) {
        this.state['img'] = img
        return this
    }
}

export class VideoWidget extends Widget {

    constructor(key) {
        super(key)
    }

    url(addr: string) {
        this.state['url'] = addr
        return this
    }

    autoplay(swi: boolean) {
        this.state['auto'] = swi
        return this
    }
}

export class ChartWidget extends Widget {

    constructor(key) {
        super(key)
    }

}