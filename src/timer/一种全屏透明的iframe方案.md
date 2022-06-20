<!--
 * @文件描述:
 * @公司: thundersdata
 * @作者: 于效仟
 * @Date: 2022-05-18 10:27:24
 * @LastEditors: 于效仟
 * @LastEditTime: 2022-06-20 11:18:42
-->

背景
某日正在开发，产品发来一个消息：咱们的 xx 功能想尽快加到 xx 平台，能不能嵌个 iframe 在他们平台显示。我问：咱们的页面也有几层交互，为什么不直接跳到咱们的页面。产品说：直接跳新页面会有割裂感造成用户流失。
想想也合理，那就开工吧。
目标
第三方平台想嵌入已有功能，展示形式是浮层。
探索过程
首先考虑到想集成的功能内有列表组件，所以使用通高的抽屉样式。我们在抽屉组件的内容区嵌一个 Iframe，也就是抽屉包裹 iframe。很快就达到了如下的效果。

那这不是完事了吗，然后我就点点集成进来的功能检查下吧。当回归到触发后有 modal 提示框的功能时，出现了如下图所示的效果，原有的弹窗只展示在 iframe 所在区域。不只是 modal，一切浮动元素如 message 组件都会只展示在右侧的 iframe 中。这可离了大谱了。

此时方法有两种，第一种，通过 postmessage 通信调用父级页面提供的弹窗。
// 子页面发通知

```JS
window.parent.postMessage(
{
type: 'close',
location: 'Modal',
},
'\*'
);

// 父页面监听
useEffect(() => {
window.addEventListener('message', (e) => {
console.log(e, 'eee')
if (e.data.type === 'close') {
// 触发父页面的弹窗显示或隐藏
setstate(false)
}
}, false);
}, [])
第二种是通过 antd modal 提供的 API getContainer，指定 Modal 挂载的 HTML 节点到子页面父级容器。
<Modal
// ...
getContainer={() => window.parent.document.body}
```

> 加入如上代码，弹窗是可以居中了，但是由于 dom 被挂载到外层，但是样式还在原本子应用内，所以样式丢失了，如图中“哈哈哈”文字不再是红色。并且如果有多个浮层，每个浮层都需要手动加 getContainer，这种方式也显得十分笨重。

技术尝试
难道就没有其他的办法了吗？
如果父页面写一个全屏样式的 iframe，背景透明，子页面承载抽屉组件，也就是 iframe 包裹抽屉。效果怎么样？我们来试一下。
父页面代码

```JS
function Demo() {
const [state, setstate] = useState(true)
useEffect(() => {
window.addEventListener('message', (e) => {
console.log(e, 'eee')
if (e.data.type === 'close') {
setstate(false)
}
}, false);
}, [])
const ref = useRef(null)

const devurl = 'https://local.xxx.com:3030'

return (
<div id='demo'>
Demo
<Button onClick={() => setstate(true)}>点击跳出</Button>

      {state && <iframe id='testComp'
        className='moudle-iframe'
        src={devurl}
        ref={ref}
      />}
    </div>

);
}

.moudle-iframe {
border: none;
width: 100%;
min-height: 900px;
overflow: hidden;
overflow-y: scroll;
position: absolute;
right: 0;
top: 0;
background-color: transparent;

    &::-webkit-scrollbar {
        display: none;
    }

}
```

父页面 index.html 加入

```JS
<bodystyle="background-color: transparent;overflow: hidden">来还原遮罩层效果。
子页面代码
<Drawer
title={renderTitle()}
className={styles.modal}
placement="right"
visible={modalShow}
onClose={() => {
setModalShow(false);
// TODO:IFRAME 通信
window.parent.postMessage(
{
type: 'close',
location: 'Modal',
},
'\*'
);
}}
width={600}

>
</Drawer>
```

    功能DEMO

效果如下图所示，录制软件有卡顿情况，实际效果流畅。

总结
方案没有绝对好坏，而是适不适合，这个方案当然也有缺陷和考虑不周的地方。但是它在我当前的业务场景下带来了了以下两个优点：
1、 解决了 iframe 内弹窗被限制在当前 body 区域
2、 接入方配置好全局的 iframe 和监听函数，相同场景可以作为公共组件使用。
如果问还有没有更好的方法，我觉得还是有的，说服产品新开页面，先把功能串起来看看流量怎么样再做优化也是个不错的选择。毕竟"要么解决需求要么解决提需求的人"，哈哈哈。
