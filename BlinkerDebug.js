const Utility = require('./BlinkerUtility');
ut = new Utility();

function isNull(data) { 
    return (data == '' || data == undefined || data == null) ? '' : data; 
}

exports.log = function(msg1, msg2, msg3, msg4, msg5, msg6) {
    msg1 = isNull(msg1);
    msg2 = isNull(msg2);
    msg3 = isNull(msg3);
    msg4 = isNull(msg4);
    msg5 = isNull(msg5);
    msg6 = isNull(msg6);
    
    console.log('[' + ut.millis() + '] ' + msg1 + msg2 + msg3 + msg4 + msg5 + msg6);
}

exports.error_log = function(msg1, msg2, msg3, msg4, msg5, msg6) {
    msg1 = isNull(msg1);
    msg2 = isNull(msg2);
    msg3 = isNull(msg3);
    msg4 = isNull(msg4);
    msg5 = isNull(msg5);
    msg6 = isNull(msg6);
    
    console.log('[' + ut.millis() + '] Error: ' + msg1 + msg2 + msg3 + msg4 + msg5 + msg6);
}

// BLINKER_LOG('12313');
// BLINKER_LOG('12313', '12313');