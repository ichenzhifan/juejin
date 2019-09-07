# 目录
- new到底做了哪些事情
- 手写一个new方法

---
# new到底做了哪些事情
我们先写一段很简单的代码，定义一个Person类, 使用new来创建一个Person的实例.

```javascript
function Person(firtName, lastName) {
  this.firtName = firtName;
  this.lastName = lastName;
}

Person.prototype.getFullName = function () {
  return `${this.firtName} ${this.lastName}`;
};

const tb = new Person('Chen', 'Tianbao');
console.log(tb);
```
查看一个控制台中tb实例的.

