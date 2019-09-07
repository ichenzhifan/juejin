### 简介
Javascript中的promise, 实际开发中用的很普遍,解决了回调地狱问题. 同时提供的静态方法如all, race, allSettled等, 为我们处理多个异步, 带来了极大的方便. 
计划分两节, 彻底的把promise搞明白.
- 第一节: 介绍promise中有哪些静态方法和实例方法, 及其使用.
- 第二节: 手写一个promise.

###  Promise中的方法
- 静态方法:
    - all
    - race
     - reject
     - resolve
     - allSettled: t39第四阶段草案（draft）.
- 实例方法:
     - then
     - catch
     - finally

首先先定义4个promise, 方便后面演示.
``` javascript
// 定义3个promise.
const p1 = Promise.resolve('success');
const p2 = Promise.reject('failed');
const p3 = new Promise((resolve, reject) => setTimeout(reject, 1000));
const promises = [p1, p2, p3];
```

### Promise.resolve
描述: 返回一个promise, 执行成功的回调
``` javascript
 p1.then(result => {
  console.log(result);
 }, err => {
   // 未被调用
 });
```
   
### Promise.reject
描述: 返回一个promise, 执行失败的回调
``` javascript
p2.then(result => {
   // 未被调用
 }, err => {
  console.log(err)
 });
```
### Promise.all
描述: 返回一个promise:
- 如果参数中所有都执行成功，那么此实例执行成功的回调
- 如果参数中有一个执行失败, 那么此实例立即执行失败的回调. 失败的原因是第一个promise失败的结果.

``` javascript
Promise.all(promises).then(results => {
  console.log(results);
  // 此处未执行
}, err => {
  console.log(err);
})
```

### Promise.race
描述: 返回一个promise，一旦参数中某个promise执行成功或失败, 就立即执行对于的回调.

``` javascript
Promise.race(promises).then(results => {
  console.log(results);
}, err => {
  // 此处未执行
  console.log(err);
})
```

### Promise.allSettled
描述: 返回一个promise对象, 给定的所有promise都被成功解析或被失败解析，并且每个对象都描述每个promise的结果.

``` javascript
Promise.allSettled(promises).then(results => {
  // 输出结果:
  // - fulfilled
  // - reject
  // - reject
  results.forEach(m => console.log(m.status));
})
```

### 实例方法
描述: 实例方法
- then: 接收两个参数, 执行成功或失败的回调.
- finally: 无论promise执行成功与否, 都会执行的回调.
- catch: promise执行失败后的回调.

``` javascript
p1.then(result => {
  console.log(result + '- 01')
  return result;
}, err => {
  // 未被执行
  console.log(err);
}).then(result => {
  console.log(result + '- 02')

  // 等同于第一个then上的直接返回. return result.
  return Promise.resolve(result);
}, err => {
  // 未被执行
  console.log(err);
}).then(result => {
  console.log(result + '- 03')

  // 如果要执行失败的回调，需要显示的返回一个reject.
  return Promise.reject(result);
}, err => {
  // 未被执行, 前面的reject会被后面的then或catch接收
  console.log(err);
}).then(result => {
  // 未被执行.
  console.log(result + '04');
}, err => {
  // 失败执行了.
  console.log('失败执行了');
  return 'demo';
}).then(result => {
  // 这里执行了. 由于前面的then返回的是一个'demo'，等同于Promise.resolve
  console.log(result + '05');
  return Promise.reject('抛出新Error')
}, err => {
  // 未被执行.
}).catch(err => {
  // 被执行了.
  console.log('catch执行了:' + err);
}).finally(result => {
  console.log('finally执行了');
})

// 执行后的输出结果是:
// success- 01
// success- 02
// success- 03
// 失败执行了
// demo05
// catch执行了:抛出新Error
// finally执行了
```

了解完promise的使用之后, 是不是特别想知道这么强大的promise是怎么实现的呢? 手写promise, 带你一步步实现.

### JavaScript中的Promise（二），马上就来...

### demo
[代码]()