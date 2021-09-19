# blinker-nodejs  

## 支持文档  
[文档](https://diandeng.tech/doc/javascript-support)  

## 环境/依赖安装  
最新nodejs LTS版本  
```
npm i -g ts-node
git clone https://github.com/blinker-iot/blinker-js.git
cd blinker-js
npm i
```

## 运行示例  

替换example.ts中的以下语句，参数为app中申请到的设备的authkey  
```
let device = new BlinkerDevice('xxxxxxxxxxxx');
```
运行示例程序：  
```
ts-node .\example\example.ts
```

## 组件支持  
ButtonWidget  
TextWidget  
NumberWidget  
RangeWidget  
RGBWidget  
JoystickWidget  

## 已支持  
基本MQTT通信  
Layouter组件  
时序数据存储(仅限blinker broker)    
文本数据存储(仅限blinker broker)    
对象数据存储(仅限blinker broker)  
倒计时  
定时  
短信通知  
微信通知  
App推送  
局域网ws通信  
设备分享  
天气/天气预报/空气 数据获取  
语音助手（小度/天猫精灵/小爱）  

## 即将支持  
APCONFIG(AP配网)  
QRCONFIG(扫码配置)   
专属设备  
更多组件支持  

## 可用配置项  
关闭本地webSocket  
```js
let device = new BlinkerDevice('authkey',{
    webSocket:false
});
```

## 使用到的相关项目  
http请求 [axios](https://github.com/axios/axios)  
二维码生成 [qrcode-terminal](https://github.com/gtanner/qrcode-terminal)  
wifi ap配置[wireless-tools](https://github.com/oblique/create_ap)  
其他见package.json  