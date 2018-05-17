var Utility = require('./BlinkerUtility');
ut = new Utility();

function isNull(data) { 
    return (data == '' || data == undefined || data == null) ? '' : data; 
}

exports.log = function(msg1, msg2, msg3, msg4) {
    msg1 = isNull(msg1);
    msg2 = isNull(msg2);
    msg3 = isNull(msg3);
    msg4 = isNull(msg4);
    
    console.log('[' + ut.millis() + '] ' + msg1 + msg2 + msg3 + msg4);
}

// BLINKER_LOG('12313');
// BLINKER_LOG('12313', '12313');