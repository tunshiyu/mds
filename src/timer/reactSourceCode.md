<!--
 * @文件描述:
 * @公司: thundersdata
 * @作者: 于效仟
 * @Date: 2020-12-03 21:31:09
 * @LastEditors: 于效仟
 * @LastEditTime: 2020-12-08 23:40:04
-->

## react 源码学习

## 2020 年 12 月 3 日 21:31:46

计划：12.3-12.15
共 13 节，每晚抽出最少 20 分钟学习 10 分钟复习

#### 1、jsx 简介 16.x 版本 17.x 版本已经不行

creact-react-app myreactjs 创建项目 code . 可以快速用 vscode 打开当前文件

最基础就是 ReactDom.reander 和 React.createElement
React.createElement 不常见是因为我们写的 return 里的类 html 结构被 babel 自动转成 js（也就是 React.createElement）执行，那个类 html 结构就叫做 jsx。

所谓的虚拟 dom，就如下对象来描述一个 dom:

```js
const dom = {
  type: 'h1',
  props: {
    title: 'foo',
    children: '哈哈哈',
  },
};
```

#### 2、render 里面会进行递归导致卡顿。

当 dom 庞大的时候会卡顿。后面状态改变触发 diff 的时候也会出现类似的问题。
那么这个问题该如何解决呢？
web api 有一个 requestIdleCallback 可以利用游览器的空闲时间执行任务，这样就不会影响关键事件。
注意：最新版的 react 已经写了一个函数自己去实现这个逻辑，也就是利用空闲时间执行任务的函数。

#### 3、 事件流

```js
// 下一个单元任务
const nextUnitofWork  = null;

// 调度我们的render或者diff
func workFlow(deadline){
 // 有下一个任务并且当前帧还没有结束
 // 判断并且赋值给nextUnitofWork

requestIdleCallback(workFlow)

}
//  启动空闲时间处理空闲时间
requestIdleCallback(workFlow)

// 获取下一个任务
func performUnitOfWork(fiber){

}

```
