# blinker-nodejs  
[文档](https://diandeng.tech/doc/javascript-support)  

## 环境/依赖安装  
```
git clone https://github.com/blinker-iot/blinker-js.git
cd blinker-js
npm i -g ts-node
npm i
```

## 运行示例  

替换example.ts中的以下语句，参数为app中申请到的设备的authkey  
```
let device = new BlinkerDevice('xxxxxxxxxxxx');
```
运行示例程序：  
```
ts-node example.ts
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

## 即将支持  
语音助手  
专属设备  
局域网ws通信  
更多组件支持  
设备分享  
自动化  


# blinker-cli(开发中)  

blinker start --type {deviceType} --key {deviceType}  

blinker restart

blinker stop

## blinker start  

第一次启动，检查是否有config.json，没有则创建
config.json:

``` json
{
    "type":"",
    "key:":"",
    "device":""
}
```
