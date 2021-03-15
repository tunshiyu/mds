<!--
 * @文件描述:
 * @公司: thundersdata
 * @作者: 于效仟
 * @Date: 2021-02-27 10:19:31
 * @LastEditors: 于效仟
 * @LastEditTime: 2021-03-15 11:11:13
-->

## [flatten 的递归和迭代实现](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/54#issuecomment-474165134)

## 函数柯里化

fn(1)(2) // 1+2
fn(1)(2)(3) // 1+2\*3

```js
// 实现一个add方法，使计算结果能够满足如下预期：
add(1)(2)(3) = 6;
add(1, 2, 3)(4) = 10;
add(1)(2)(3)(4)(5) = 15;

function add() {
  // 第一次执行时，定义一个数组专门用来存储所有的参数
  var _args = Array.prototype.slice.call(arguments);

  // 在内部声明一个函数，利用闭包的特性保存_args并收集所有的参数值
  var _adder = function() {
    _args.push(...arguments);
    return _adder;
  };

  // 利用toString隐式转换的特性，当最后执行时隐式转换，并计算最终的值返回 (在这里判断_args长度来返回不同的值)
  _adder.toString = function() {
    return _args.reduce(function(a, b) {
      return a + b;
    });
  };
  return _adder;
}

add(1)(2)(3); // 6
add(1, 2, 3)(4); // 10
add(1)(2)(3)(4)(5); // 15
add(2, 6)(1); // 9
```

## {'a_b_c':2} => {'aBC':2}

```js
function getCamelCase(str) {
  return str.replace(/-([a-z])/g, function(all, i) {
    return i.toUpperCase();
  });
}
console.log(getCamelCase('get-element-by-id')); //getElementById
```

## [{id:1,children:[{id:2,children:[]}]}]去掉 id 为偶数且没有 children 的
