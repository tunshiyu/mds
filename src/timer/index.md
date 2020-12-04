## 10.19-10.24

## 1、 iframe 跨域

后端可以加 header

## 2、 模糊搜索用 select

filterOption 做下拉过滤,onchange 做数据过滤

```js
allowClear
              showSearch
              options={storeOption}
              optionFilterProp="children"
              filterOption={(input, option) =>
                !!(
                  option?.label &&
                  option?.label
                    .toString()
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                )
              }
              maxTagCount={10}
```

## 3、 为什么 react16+ ref 变成了变量而不是以前的 string 类型

forwardRef 解决 HOC 组件传递 ref 的问题。因为 ref 变成了参数，string ref 就没法用了。

## 4、 createElement

我们平常基本看不到，因为我们写的 tsx，经过 babel 会转换成

```
// jsx
<div id="app">content</div>

// js
React.createElement('div', { id: 'app' }, 'content')
```

## 5、 generater

es6 新推出的。yield 关键字 是其核心，然后通过 .next 进行异步函数的处理。
遇到 yield 阻塞，next 继续。遇到 return 后，返回的{value:done:xx}中 done 会变为 true。

## 6、 React 源码使用的是 flow，是 Facebook 自家的静态带有类型的语言。不使用 ts 1 是因为 ts 出的晚，不完善当时 2 是 react 体系太大，不好迁移

## 7、 setState 和 forceUpdate 的代码我们可以看到，几乎是一模一样的。唯一的区别是 Update.tag

tag 是改变的类型 tag: 0 | 1 | 2 | 3,

## 8、Fiber 大白话：

#### 维护每一个分片的数据结构，就是 Fiber

首先呢，React 之前有个问题，主线程被占用一次性执行。如果页面元素很多，一次性占用可能超过 16ms，就会造成掉帧。

解决这个问题就引入了 React fiber.

#### fiber:光纤。

#### React 框架内部的运作可以分为 3 层：

- Virtual DOM 层，描述页面长什么样。
- Reconciler 层，负责调用组件生命周期方法，进行 Diff 运算等。
- Renderer 层，根据不同的平台，渲染出相应的页面，比较常见的是 ReactDOM 和 ReactNative。

#### Fiber Reconciler 分两个阶段

1、 构建 fiber 树，这个过程是渐进的，可打断的。如果遇到优先级更高的任务, Fiber Reconciler 会丢弃正在生成的树，在空闲的时候再重新执行一遍。

在构造 fiber 树的过程中，reconciler 会将需要更新的节点放到 Effect list 中，在步骤二执行的时候，会被批量更新。

2、 将需要更新的节点进行批量更新。这是不间断的。

## 9、 权限管理 pms

权限一般分为两种类型： 页面权限和功能权限。(页面权限决定用户是否可以看到某个页面、功能权限决定用户是否可以访问某个功能的 API)
一般由前端负责页面权限，后端负责功能权限。

## 10、封装一个深比较的 useEffect

背景： 比如依赖的是一个引用类型如对象，每次都是全新的引用，会导致 触发渲染=>effect => 触发渲染的无限更新死循环。

两种解决：

```js
const getDep = () => {
  return {
    foo: 'bar',
  };
};
//利用转成字符串的方式，使能判断其值真正改变
const dep = JSON.stringify(getDeps());

useEffect(() => {
  // ok!
}, [dep]);
```

```js
import { isEqual } from 'lodash';

export function useDeepCompareEffect(fn, deps) {
  const trigger = useRef(0);
  const prevDeps = useRef(deps);
  <!--使用lodash isEqual来进行深比较-->
  if (!isEqual(prevDeps.current, deps)) {
    trigger.current++;
  }
  prevDeps.current = deps;
  return useEffect(fn, [trigger.current]);
}
```

## 12、 usehooks 家族到底是咋回事

```js
function resolveDispatcher() {
  const dispatcher = ReactCurrentOwner.currentDispatcher;
  return dispatcher;
}

export function useState<S>(initialState: (() => S) | S) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

export function useEffect(
  create: () => mixed,
  inputs: Array<mixed> | void | null,
) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, inputs);
}

export function useContext<T>(
  Context: ReactContext<T>,
  observedBits: number | boolean | void,
) {
  const dispatcher = resolveDispatcher();
  // dev code
  return dispatcher.useContext(Context, observedBits);
}
```

通过上面代码可以看出来其实，hooks 都是从 ReactCurrentOwner.currentDispactcher 拿到的。
那么这个 ReactCurrentOwner.currentDispatcher 是啥呢？

当我们 renderRoot 执行的时候会执行如下，在离开 renderRoot 的时候又会置为 null

```js
import { Dispatcher } from './ReactFiberDispatcher';

if (enableHooks) {
  ReactCurrentOwner.currentDispatcher = Dispatcher;
}
```

## 13、 codesandbox 如何提升自己的 npm 在线打包速度

打包过程中生成 minfets 通过 s3 上传到服务器，如果下次安装同一版本，直接取相同的 minfets。
