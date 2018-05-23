var os_start_time = Date.now();

// console.log(os_start_time);
function Utility() {
    this.millis = function() {
        var now_time = Date.now() - os_start_time;
        return now_time;
    }
}

module.exports = Utility;