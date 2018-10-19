# weex-webview SDK协定

> 注：该协议仅适用于中移动物联网-中移和物`weex-webview`模板开发，请勿进行复制等其他用途。

| 时间                 | 修订者                  | 修订说明               |
| -------------------- | ----------------------- | ---------------------- |
| 2018.8.31 - 2018.9.4 | codedreamfy@outlook.com | WeexWebview SDK制订    |
| 2018.9.17            | codedreamfy@outlook.com | 增加通信流程，完善文档 |
| 2018.9.25            | codedreamfy@outlook.com | 修改上报数据格式 |
| 2018.10.10           | codedreamfy@outlook.com | 完善部分内容，增加修改标题栏方法 |

### MQTT 与 WebView 通信流程

![MQTT与WebView通信方式](https://raw.githubusercontent.com/CodeDreamfy/weex-webview-docs/master/img/MQTT%E4%B8%8EWebview%E9%80%9A%E4%BF%A1%E6%96%B9%E5%BC%8F.png)



### webView初始化目前可提供的数据

```javascript
{
    data: {
        device_sn: String, // 设备sn
        device_id: Number, // 设备id
        product_id: Number, // 产品id
        device_online: Boolean, // 设备是否在线 (目前仅能支持首次传入，不支持过程获取，且仅当目前状态改变才会触发推送上报给h5设备离在线)
        weex_domain: String, // weex地址，可用来设置postMessage的targetOrigin
        platform: 'Android' | 'iOS' | 'Web', // 手机系统环境
        deviceWidth: Number, // 屏幕宽度
        deviceHeight: Number, // 屏幕高度
	},
    functions: [
        {
            down: true, // 功能点是否允许下发
            index: 256, // 功能点序列，下发需要用到，function-index
            name: "Data", // 功能点名称
            subject: "Data", // 字段名称
            type: "BYTES", // 字段类型
            up: true, // 功能点是否允许上报
            ..., // 其他参数可忽略
        },
        ...
    ]
}
```

## 必要步骤

### 第一步

页面加载完成后，需要监听`Message`事件，以便`weex`向webview发送消息

**接收消息**

```javascript
window.addEventListener('message', function(event){
    console.log(event.data) // type: Obejct,  data内部为传递的数据
    switch(event.data.type) {
      case "initParams": // 接收初始化数据
        // todo:
        break;
      case "connectStatus": // MQTT连接状态
        // todo
        break;
      case "command_resp": // 命令响应
        // todo:
        break;
      case "status": // 设备状态上报
        // todo
        break;
      case "connection": // 设备上下线
        // todo:
        break;
      case 'first-status': // 设备状态同步
        // todo:
        break;
      default:
        // todo:
    }
})
```

### 第二步

由于兼容性原因，在web端刚进入页面的时候请下发如下命令以通知`WEEX`做一些初始化的准备工作包括传递页面内需要的参数

```javascript
window.parent.postMessage({
    type: 'initParams'
}, ${weex_domain});
```


### 第三步

当`WEEX`监听到页面加载完毕后后会做以下事情：

* 开始初始化连接MQTT，返回连接状态

* 如果设备是真实设备的话，会下发初始化状态同步，返回所有**允许上报**的字段的最近一次状态

* 等待接口返回后将完整页面需要的初始化参数返回给页面

> 注意：返回参数这个过程可能是异步的，不会立即返回，因为部分参数是通过接口请求回来的

**所有数据下发和上报均采用的`JSON.stringify`进行了字符串化**

---- 


## 数据通信API格式

#### 下发消息（默认下发命令）

```javascript
window.parent.postMessage(command, ${weex_domain}); // command: Object; webview 发送消息
```

> PostMessage API可参考[MDN-Window-PostMessage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)

#### 初始化数据

`type: 'initParam'` : **weex->webview**发送初始化需要的信息

```javascript
// webview主动发送初始化信息
{
    type: 'initParam', 
    data: {}
}
// 返回
{
    type: 'initParam', // 使用type作为数据类型的标注
    data: {
        device_id: Number,
        product_id: Number,
        device_online: Boolean,
    },
    embed: {
        functions: [
            { 
                index: 1, 
                type: ['STRING','BOOLEAN','FLOAT','INTEGER','ENUM','BUFFER'],
                up: true || false,
                down: true || false,
                name: '',
                // 具体以上方详细参数为准
            }
        ]
    }
}
```

> 注意： 数值类型是有作区分的，与平台保持一致：INTEGER || FLOAT



#### MQTT连接状态上报

`type: 'connectStatus'`

**MQTT**连接成功或者失败，将在进入页面且有APP有网的情况下会主动进行mqtt连接，mqtt连接后可以看到

```javascript
{
    type: 'connectStatus',
    data: {
        status: *Boolean, // true / false ,
    }
}
```



#### 命令下发

`type: 'command'`

**webview**下发命令

```javascript
{
    type: 'command',
    data: {
        task_id: *UUID, // 可使用uuid的库来生成
        function: Number, // function index
        type: *, // 功能点类型 ['STRING','BOOLEAN','FLOAT','INTEGER','ENUM','BUFFER']
        value: *, // 功能点值
    }
}
```

> 下发的`task_id`请使用[uuid/v1](https://www.npmjs.com/package/uuid)版本的第一段
>
> eg: 
>
> ```javascript
> const uuidv1 = require('uuid/v1');
> let uuid = uuidv1().split('-')[0]; // ⇨ '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e'
> ```



#### 命令下发响应

`type: 'command_resp'`

用于**webview**接收命令下发的响应结果

```javascript
{
    type: 'command_resp',
    data: {
        task_id: *UUID, // 下发命令对应的uuid
        result: *Boolean, // 注：下发到服务器的结果，但不代表设备收到
    }
}
```



#### 数据上报

`type: 'status'`

**MQTT**上报的传感器数据（目前是单点上报，即每次上传仅上报单个功能点）


```javascript
{
    type: 'status',
    data: {
        function: 1,
        type: String, // 'BOOLEAN' / 'STRING' / 'INTEGER' / 'FLOAT' / 'BUFFER' / 'EXCEPTION'
        value: *,
    }
}
```

> 举个栗子
```javascript
{
    type: 'status',
    data: {
        function: 1
        type: "BOOLEAN"
        value: true
    }
}
```



#### 设备首次上报

`type: 'first-status'`

服务器上报到**webview**,设备连上MQTT后将进行上报、仅针对真实设备

> 注意：设备首次上报的值均为String，需要自主转换成对应的值，这里建议使用JSON.parse来对值进行转换

```javascript
{
    type: 'first-status',
    data: {
        function: value, // function的index作为key，值为value， 同状态上报
        ...
    }
}
```



#### 设备上下线

`type: 'online'`

服务器上报到**webview**,只有当设备状态改变时候才会上报

```javascript
{
    type: 'online',
    data: {
        status: *Boolean, // 在线 / 离线
    }
}
```



### 使用系统提示

`type: 'modal'`

将调用weex自带modal，主要包括['toast','alert']，具体api可参考[WEEX-API](https://weex.incubator.apache.org/cn/references/modules/modal.html)

```javascript
{
    type: 'modal',
    data: {
        method: 'toast' | 'alert',
        options: {
            message: String, // 如果传递Obejct 将转换成 `Object object`
            duration: 0.3, // 以秒为单位，默认可以不传递
        }
    }
}
```

### 修改标题栏内容和颜色

`type: 'changeNavigationBar'`

修改顶部导航栏标题内容和背景颜色

```javascript
{
   type: 'changeNavigationBar',
   data: {
       title: String, // 标题栏文字内容, 默认：''，暂不会恢复默认标题
       background: String, // 标题栏背景色，仅支持十六进制格式， 默认： #ffffff
       dark: 'dark' || 'light', // 标题栏字体仅有黑白可选，默认：dark
       showDivider: Boolean, // 是否显示标题栏底部的分割线，默认: true
   }
}
```


### Example

```javascript

// 本例使用的语法多使用es6的，建议在构建工具中运行，webpack、gulp、babel

const uuidv1 = require('uuid/v1'); // 普通页面不支持require，请使用构建工具或者页面内引入

// 监听weex发送的数据
window.addEventListener('message', function(event){
    const payload = JSON.parse(event.data); // 默认传递过来是String,  data内部为传递的数据
    switch(payload.type) {
      case "command_resp":
        // todo:
        break;
      case "status":
        // todo
        break;
      case "connection":
        // todo:
        break;
      case 'first-status':
        // todo:
        break;
      case "initParams":
        // todo:
        init(payload.data)
        break;
      default:
        // todo:
    }
})

function init() {

}

// 下发初始化消息获取参数
window.addEventListener('DOMContentLoaded', function() {
    window.parent.postMessage({
        type: 'initParams'
    }, '*');
})


// 下发数据方法
function publish(command) {
    window.parent.postMessage({
        type: 'command',
        data: {
            task_id: uuidv1().split('-')[0], // 可使用uuid的库来生成，也可以随机字符串
            function: 232, // function index
            type: 'BOOLEAN', // 功能点类型
            value: true, // 功能点值
        }
    }, '*')
}
```

