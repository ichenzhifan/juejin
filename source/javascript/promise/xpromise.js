// new XPromise((resolve, reject) => {

// })
// .then(resolve, reject)
// .catch(ex => {}).
// finally(result => {})

const s = {
  pending: 'pending',
  fulfilled: 'fulfilled',
  rejected: 'rejected'
};

/**
 * 出来then中的返回结果. 方便链式调用.
 * @param {*} promise 
 * @param {*} result 
 * @param {*} resolve 
 * @param {*} reject 
 * @returns {XPromise} 返回一个promise.
 */
const resolvePromise = (promise, result, resolve, reject) => {
  // 参数判断.
  // 判断result和promise是否为相同的引用.防止循环引用.
  if (promise === result) {
    return reject(new TypeError('循环引用了.'));
  }

  // 用来记录promise的状态是否改变过. 
  // 一旦改变就不能再次更改成其他的状态.
  let isCalled;

  if(result !== null && 
    (typeof result === 'object' || typeof result === 'function')){
      try {
        const then = result.then;
        if(typeof then === 'function'){
          then.call(result, newResult => {
            if(isCalled)return;
            isCalled = true;

            // 这个newResult可能依旧是一个promise对象, 所以要递归调用.
            resolvePromise(promise, newResult, resolve, reject);
          }, error => {
            if(isCalled)return;
            isCalled = true;
            reject(error);
          });
        }else{
          resolve(result);
        }
      } catch (error) {
        if(isCalled)return;

        isCalled = true;
        reject(error);
      }
  }else{
    // 如果是一个普通值 那么就直接把result作为promise
    // 的成功的回调.
    resolve(result);
  }
};

class XPromise {
  static resolve(val) {
    return new XPromise((resolve) => resolve(val));
  }

  static reject(reason) {
    return new XPromise((resolve, reject) => reject(reason));
  }

  /**
   * - 如果参数中所有都执行成功，那么此实例执行成功的回调
   * - 如果参数中有一个执行失败, 那么此实例立即执行失败的回调. 失败的原因是第一个promise失败的结果.
   * @param {Array} promises Promise集合.
   * @returns {XPromise} 返回一个promise.
   */
  static all(promises) {
    return new XPromise((resolve, reject) => {
      const arr = [];

      promises.forEach((p, i) => {
        p.then(data => {
          arr[i] = data;
        }, reject);
      });

      resolve(arr);
    });
  }

  static race(promises) {
    return new XPromise((resolve, reject) => {
      promises.forEach((p) => {
        // resolve后，状态不能改变
        p.then(resolve, reject);
      });
    });
  }

  static allSettled(promises) {
    return new XPromise((resolve, reject) => {
      const arr = [];

      promises.forEach((p, i) => {
        p.then(data => {
          arr[i] = data;
        }, reason => {
          arr[i] = reason;
        });
      });

      // 等待所有都执行完成后, 再返回.
      resolve(arr);
    });
  }

  static deferred() {
    const defer = {}
    defer.promise = new XPromise((resolve, reject) => {
      defer.resolve = resolve
      defer.reject = reject
    })
    return defer
  }

  constructor(cb) {
    // 设置初始状态为pending.
    this.status = s.pending;

    // 存储成功后的值.
    this.value = null;

    // 存储失败的原因.
    this.reason = null;

    // 执行成功的回调搜集.
    this.resolveCallbacks = [];

    // 执行失败的回调搜集
    this.rejectCallbacks = [];

    const resolve = val => {
      // 如果状态是pending, 就更改.
      if (this.status === s.pending) {
        this.status = s.fulfilled;
        this.value = val;
        this.resolveCallbacks.forEach(cb => cb())
      }
    };

    const reject = reason => {
      if (this.status === s.pending) {
        this.status = s.rejected;
        this.reason = reason;
        this.rejectCallbacks.forEach(cb => cb());
      }
    };

    cb(resolve, reject);
  }

  then(resolve, reject) {
    // 对参数做检查.
    // 可能的调用: .then('success', 'error')
    // 如果不是一个方法, 就使用默认的函数.进行值传递即可.
    const onResolved = typeof resolve === 'function' ? resolve : val => val;
    const onRejected = typeof reject === 'function' ? reject : err => {throw err};

    // 返回的是另一个promise对象.
    const newPromise = new XPromise((resolve, reject) => {
      // 如果调用then的时候promise的状态已经变为完成.
      // 那么调用成功的回调, 并传递参数.
      if (this.status === s.fulfilled) {
        // 使用setTimeout来模拟异步.
        setTimeout(() => {
          // 如果执行回调时, 发生异常.
          // 那么就将异常作为promise失败的原因.
          try {
            let result = onResolved(this.value);

            // 调用resolvePromise函数, 更具result的值来决定newPromise的状态.
            resolvePromise(newPromise, result, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if (this.status === s.rejected) {
        // 使用setTimeout来模拟异步.
        setTimeout(() => {
          // 如果执行回调时, 发生异常.
          // 那么就将异常作为promise失败的原因.
          try {
            let result = onRejected(this.reason);

            // 调用resolvePromise函数, 更具result的值来决定newPromise的状态.
            resolvePromise(newPromise, result, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      // 如果调用then时状态还是pending. 说明promise执行
      // 内部的resolve或reject是异步的. 需要把then中的成功回调和失败回调
      // 先存储起来, 等等promise的状态改为成功或失败的时候再执行.
      if (this.status === s.pending) {
        this.resolveCallbacks.push(() => {
          setTimeout(() => {
            try {
              const result = onResolved(this.value);
              resolvePromise(newPromise, result, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0)
        });

        this.rejectCallbacks.push(() => {
          setTimeout(() => {
            try {
              const result = onRejected(this.reason);
              resolvePromise(newPromise, result, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });

    return newPromise;
  }

  catch(reject) {
    // 实际执行的是then的第二个参数.
    return this.then(null, reject);
  }

  finally(cb) {
    // then的resolve和reject都要执行.
    return this.then(cb, cb);
  }
}

module.exports = XPromise;