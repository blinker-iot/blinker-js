# blinker-nodejs

## 环境/依赖安装  
```
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

## 即将支持  
语音助手  
专属设备  
局域网ws通信  
更多组件支持  