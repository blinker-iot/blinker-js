# blinker JavaScript/TypeScript SDK  

本SDK可用于 **Linux/Windows/MacOS** 设备MQTT接入  
**亦适用于树莓派等带操作系统的嵌入式设备**  

使用WiFi接入，当设备和手机在同一个局域网中，为局域网通信  
其余情况，使用MQTT远程通信  

## 准备工作
开始使用前您需要做好如下准备:  

**下载并安装blinker APP**  
**Android下载：**  
[点击下载](https://github.com/blinker-iot/app-release/releases) 或 在android应用商店搜索“blinker”下载安装  
**IOS下载：**  
[点击下载](https://itunes.apple.com/cn/app/id1357907814) 或 在app store中搜索“blinker”下载  


## 环境/依赖安装  
运行blinker程序需要最新nodejs LTS版本及Ts-Node支持  
```
npm i -g ts-node
git clone https://github.com/blinker-iot/blinker-js.git
cd blinker-js
npm i
```

## 在app中添加设备，获取Secret Key  
1. 进入App，点击右上角的“+”号，然后选择 **添加设备**    
2. 点击选择**Arduino > WiFi接入**  
3. 复制申请到的**Secret Key**  

## DIY界面  
1. 在设备列表页，点击设备图标，进入设备控制面板  
2. 首次进入设备控制面板，会弹出向导页
3. 在向导页点击 **载入示例**，即可载入示例组件  
   
## 编译并上传示例程序 

**.\example\example_hello.ts** 为入门示例， 替换示例中的以下语句，修改参数为app中申请到的设备的Secret Key  
```
let device = new BlinkerDevice('xxxxxxxxxxxx');
```
运行示例程序：
```
ts-node .\example\example_hello.ts
```

> blinker在局域网通信时会使用到81端口，如遇到权限报错，请使用sudo等方式提权运行  

## 恭喜！一切就绪  

在APP中点击刚才您添加的设备，即可进入控制界面，点点按钮就可以控制设备了  
另一个按钮也点下试试，放心，您的手机不会爆炸~  

## 进一步使用blinker  

#### 想了解各接入方式的区别？  
看看[添加设备](?file=002-开发入门/001-添加设备 "添加设备")  

#### 想深入理解以上例程？  

看看[Nodejs开发入门](https://diandeng.tech/doc/getting-start-nodejs "Nodejs开发入门") 和 [JavaScript/TypeScript 支持库函数参考](https://diandeng.tech/doc/javascript-support)) 
#### 更多示例程序？  

看看[Github](https://github.com/blinker-iot/blinker-js/tree/typescript/example)  

#### 想制作与众不同的物联网设备？  
看看[自定义界面](https://diandeng.tech/doc/layouter-2)  

#### 树莓派GPIO控制？  
看看[pigpio](https://github.com/fivdi/pigpio)  

## 完整示例程序  


```javascript
import { BlinkerDevice } from '../lib/blinker';
import { ButtonWidget, NumberWidget } from '../lib/widget';

let device = new BlinkerDevice(/*您申请到的Secret Key*/);

// 注册组件
let button1: ButtonWidget = device.addWidget(new ButtonWidget('btn-123'));
let button2: ButtonWidget = device.addWidget(new ButtonWidget('btn-abc'));
let number1: NumberWidget = device.addWidget(new NumberWidget('num-abc'));

let num = 0;

device.ready().then(() => {

    device.dataRead.subscribe(message => {
        console.log('otherData:', message);
    })

    button1.listen().subscribe(message => {
        console.log('button1:', message.data);
        num++;
        number1.value(num).update();
    })

    button2.listen().subscribe(message => {
        console.log('button2:', message.data);
        // 其他控制代码
    })

})
```

## 为什么设备显示不在线？  

0. blinker App如何判断设备是否在线？  

blinker App在 **App打开时、进入设备页面时、在设备页面中每隔一定时间** 会向设备发送心跳请求，内容为**{"get":"state"}**。  
设备收到请求后，会返回 **{"state":"online"}**，app接收到这个返回，即会显示设备在线。  

1. 程序没有成功上传到开发板  

解决办法：重新上传，上传后打开串口监视器，确认程序正确运行  

2. 程序中没有设置正确的ssid和密码，导致没有连接上网络  

解决办法：设置后再重新上传程序，上传后打开串口监视器，确认程序正确运行  

3. 程序错误，导致程序运行不正确  

解决办法：先使用并理解blinker例程，再自由发挥  

4. 开发板供电不足   

解决办法：换电源 或 换USB口  

## 为什么无法切换到局域网通信？  

1. 路由器开启了AP隔离功能或禁止了UDP通信，从而阻止了局域网中设备的发现和通信  

解决办法：关闭路由器AP隔离功能 或 允许UDP通信；如果找不到相关设置，通常可重置路由器解决  

2. mdns没有及时发现设备  

解决办法：在首页下拉刷新，可以重新搜索局域网中的设备  
