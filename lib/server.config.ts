export const SERVER = {
    HOST: 'https://iot.diandeng.tech'
}

export const API = {
    AUTH: SERVER.HOST + '/api/v1/user/device/diy/auth',
    HEARTBEAT: SERVER.HOST + '/api/v1/user/device/heartbeat',
    SMS: SERVER.HOST + '/api/v1/user/device/sms',
    WECHAT: SERVER.HOST + '/api/v1/user/device/wxMsg/',
    PUSH: SERVER.HOST + '/api/v1/user/device/push',
    SHARE: SERVER.HOST + '/api/v1/user/device/share/device',
    LOG: SERVER.HOST + '/api/v1/user/device/cloud_storage/logs',
    POSITION:SERVER.HOST + '/api/v1/user/device/cloud_storage/coordinate',
    WEATHER: SERVER.HOST + '/api/v3/weather',
    WEATHER_FORECAST: SERVER.HOST + '/api/v3/forecast',
    AIR: SERVER.HOST + '/api/v3/air',
    VOICE_ASSISTANT: SERVER.HOST + '/api/v1/user/device/voice_assistant'
}
