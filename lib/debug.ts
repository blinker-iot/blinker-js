// 辅助调试
export function log(msg, { title = 'TITLE', color = 'white' } = {}) {
    // console.log(msg);

    if (typeof msg == 'object') msg = JSON.stringify(msg)
    const COLOR_CODE = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'].indexOf(color)
    if (COLOR_CODE >= 0) {
        const TITLE_STR = title ? `\x1b[4${COLOR_CODE};30m ${title} \x1b[0m ` : ''
        console.log(`${TITLE_STR}\x1b[3${COLOR_CODE}m${msg}\x1b[;0m`)
    }
    else {
        console.log(title ? `${title} ${msg}` : msg)
    }
}

export function tip(msg) {
    log(msg, { title: 'log', color: 'white' })
}

export function warn(msg) {
    log(msg, { title: 'warn', color: 'yellow' })
}

export function error(msg) {
    log(msg, { title: 'error', color: 'red' })
}


export function timerLog(msg) {
    log(msg, { title: 'timer', color: 'blue' })
}

export function mqttLog(msg) {
    log(msg, { title: 'mqtt', color: 'blue' })
}

export function vaLog(msg, title) {
    log(msg, { title: title, color: 'blue' })
}
