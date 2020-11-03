## 跟着阮一峰大大学小程序

## 一、小程序是什么

**小程序可以视为只能用微信打开和预览的网站**。小程序本质上就是页面。

小程序的特殊之处在于，虽然是网页，但是它不支持浏览器，所有浏览器的 API 都不能使用，只能用微信提供的 API。这也是为什么小程序只能用微信打开的原因，因为底层全变了。

## 二、小程序的优势

因为基于微信，所以能使用微信 App 的功能，如拍照扫描支付登录等，也不用考虑 ios 和安卓的平台差异。

## 三、基础实例

#### 1、app.js 这个脚本用于对整个小程序进行初始化、

app.js 内只有一行代码

```js
App({});
```

上面代码中，App()由小程序原生提供，它是一个函数，表示新建一个小程序实例。它的参数是一个配置对象，用于设置小程序实例的行为属性。这个例子不需要任何配置，所以使用空对象即可。

#### 2、app.json，记录项目的一些静态配置

1、 pages 属性：指明小程序包含哪些页面

```js
// 如下是pages下home目录下的home.js
{
  "pages": [
    "pages/home/home"
  ]
}
```

2 新建 pages/home 子目录。

```js
$ mkdir -p pages/home
```

3 最简单的项目结构

|- app.json
|- app.js
|- pages
|- home
|- home.wxml
|- home.js

4 app.json 文件还有一个 window 属性，用来设置小程序的窗口。window 属性的值是一个对象，其中有三个属性很常用。

- navigationBarBackgroundColor：导航栏的颜色，默认为#000000（黑色）。
- navigationBarTextStyle：导航栏的文字颜色，只支持 black（黑色）或 white（白色），默认为 white。
- navigationBarTitleText：导航栏的文字，默认为空。

```js
//代码中，window属性设置导航栏的背景颜色为红色（#ff0000），文本颜色为白色（white），标题文字为"小程序 Demo"。
{
  "pages": [
    "pages/home/home"
  ],
  "window": {
    "navigationBarBackgroundColor": "#ff0000",
    "navigationBarTextStyle": "white",
    "navigationBarTitleText": "小程序 Demo"
  }
}
```

## 四、小程序样式

#### 1、rpx 单位

rpx 是小程序为适应不同宽度的手机屏幕，而发明的一种长度单位。不管什么手机屏幕，宽度一律为 750rpx。它的好处是换算简单，如果一个元素的宽度是页面的一半，只要写成 width: 375rpx;即可。

#### 2、UI

腾讯自家的使用[WeUi](https://github.com/Tencent/weui)

## 五、小程序数据绑定

#### MVVM 模式

所谓"数据绑定"，指的是脚本里面的某些数据，会自动成为页面可以读取的全局变量，两者会同步变动。也就是说，脚本里面修改这个变量的值，页面会随之变化；反过来，页面上修改了这段内容，对应的脚本变量也会随之变化。这也叫做 MVVM 模式。

#### 小程序写法

1、 home.js 内，也就是脚本内数据注册到页面

```js
Page({
  data: {
    name: '张三',
  },
});
```

2、 home.wxml

```js
<view>
  <text class="title">hello {{ name }}</text>
</view>
```

3、 全局数据写法

```js
App({
  globalData: {
    now: new Date().toLocaleString(),
  },
});
```

使用如下：

```js
const app = getApp();

Page({
  data: {
    now: app.globalData.now,
  },
});
```

## 六、小程序事件

1、 事件是小程序跟用户互动的主要手段。小程序通过接收各种用户事件，执行回调函数，做出反应.小程序的常见事件有下面这些。

- tap：触摸后马上离开。
- longpress：触摸后，超过 350ms 再离开。如果指定了该事件的回调函数并触发了该事件，tap 事件将不被触发。
- touchstart：触摸开始。
- touchmove：触摸后移动。
- touchcancel：触摸动作被打断，如来电提醒，弹窗等。
- touchend：触摸结束。

2、 小程序允许页面元素，通过属性指定各种事件的回调函数，并且还能够指定是哪个阶段触发回调函数。具体方法是为事件属性名加上不同的前缀。小程序提供四种前缀。

- capture-bind：捕获阶段触发。
- capture-catch：捕获阶段触发，并中断事件，不再向下传播，即中断捕获阶段，并取消随后的冒泡阶段。
- bind：冒泡阶段触发。
- catch：冒泡阶段触发，并取消事件进一步向上冒泡。

```js
<view>
  <text class="title">hello {{ name }}</text>
  <button bind:tap="buttonHandler">点击</button>
</view>
```

## 七、 小程序API使用

####  客户端数据存储

wx.setStorageSync()方法属于小程序的客户端数据储存 API，用于将数据写入客户端储存。它接受两个参数，分别是键名和键值。与之配套的，还有一个wx.getStorageSync()方法，用于读取客户端储存的数据。它只有一个参数，就是键名。这两个方法都是同步的。
必须牢记的是，**客户端储存是不可靠的，**随时可能消失（比如用户清理缓存）。用户换了一台手机，或者本机重装微信，原来的数据就丢失了。所以，它只适合保存一些不重要的临时数据，最常见的用途一般就是作为缓存，加快页面显示。

####  远程数据存储

1、本地开发时，需要勾选 (不校验合法域名...)。因为微信规定，只有后台登记过的服务器域名才可以进行通信。

2、 通过wx.request()进行小程序的网络请求。
```js
  wx.request({
      url: 'http://localhost:3000/items',
      success(res) {
        that.setData({ items: res.data });
      }
    });
```

#### 用户信息展示

<open-data>组件的type属性指定所要展示的信息类型，userAvatarUrl表示展示用户头像，userNickName表示用户昵称。

<open-data>不需要用户授权，也不需要登录，所以用起来很方便。但也是因为这个原因，小程序不允许用户脚本读取<open-data>返回的信息。

#### 获取用户信息

如果想拿到用户的个人信息，必须得到授权。官方建议，通过按钮方式获取授权。

```js
 <button open-type="getUserInfo" bind:getuserinfo="buttonHandler">
    授权获取用户个人信息
  </button>
```

```js
Page({
  data: { name: '' },
  buttonHandler(event) {
    if (!event.detail.userInfo) return;
    this.setData({
      name: event.detail.userInfo.nickName
    });
  }
});
```