import { BlinkerDevice } from "./blinker";
import { vaLog } from "./debug";
import { VoiceAssistant } from "./voice-assistant";
// import Base64 from 'crypto-js/enc-base64';
// import UTF8 from 'crypto-js/enc-base64';

export class Message {
    device: BlinkerDevice;

    constructor(device) {
        this.device = device
    }

    send() { }

    update() { }
}


