let qrcode = require('qrcode-terminal');
qrcode.setErrorLevel('Q');
qrcode.generate('This will be a QRCode, eh!');