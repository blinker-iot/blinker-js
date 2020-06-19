import { Subject } from "rxjs";
import { BlinkerDevice } from "./blinker";

export class Widget {

    constructor(key) {
        this.key = key
    }

    key: string;
    state = {};
    stateChange = new Subject;
    update() {
        let message = {}
        message[this.key] = this.state
        this.device.sendMessage(message)
    }
    device: BlinkerDevice;
}

export class ButtonWidget extends Widget {
    constructor(key) {
        super(key)
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

// export class NumberWidget extends Widget {

//     constructor(key) {
//         super(key)
//     }

//     text(text) {
//         this.state['tex'] = text
//         return this
//     }

//     text1(text) {
//         this.state['tex1'] = text
//         return this
//     }

//     icon(icon) {
//         this.state['ico'] = icon
//         return this
//     }

//     color(color) {
//         this.state['clr'] = color
//         return this
//     }
// }