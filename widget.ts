import { Subject } from "rxjs";
import { Device } from "./blinker";

export class Widget {

    constructor(key) {
        this.key = key
    }

    key: string;
    data = {};
    change = new Subject;
    update() {

    }

    device: Device;
}

export class ButtonWidget extends Widget {
    constructor(key) {
        super(key)
    }
}