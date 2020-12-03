<!--
 * @文件描述:
 * @公司: thundersdata
 * @作者: 于效仟
 * @Date: 2020-12-03 21:31:09
 * @LastEditors: 于效仟
 * @LastEditTime: 2020-12-03 22:06:38
-->

## react 源码学习

## 2020 年 12 月 3 日 21:31:46

计划：12.3-12.15
共 13 节，每晚抽出最少 20 分钟学习 10 分钟复习

#### 1、jsx 简介 16.x 版本

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
