const MyPromise = (({PENDING,REJECTED,RESOLVED,PromiseValue,PromiseStatu,ChangeStatu,thenables,catchables,handleQueues,handleTask})=>{
    return class{
        constructor(exector){
            this[PromiseStatu] = PENDING;
            this[thenables] = [];
            this[catchables] = [];
            this[PromiseValue] = undefined;
            const resolve = (data) => {
                this[ChangeStatu](RESOLVED,data,this[thenables])
            };
            const reject = (data) => {
                this[ChangeStatu](REJECTED,data,this[catchables])
            }
            exector(resolve,reject);
        }
        then(thenable,catchable){
            // 添加任务队列，如果promise已经是已决状态，立即执行任务，因为此时已经无法添加到任务队列中,
            // then 返回一个promise
            // 处理promise串联
            return this[handleQueues](thenable,catchable);
        }
        catch(catchables){
            return this[handleQueues](null,catchables);
        }
        [ChangeStatu](statu,data,queue){
            // 首先判断当前状态是否是已决状态，如果是已决状态无法变更
            if(this[PromiseStatu] !== PENDING){
                return ;
            }
            this[PromiseStatu] = statu;
            // 设置promiesValue，如果已决,then方法需要使用promiseValue
            this[PromiseValue] = data;
            // 处理任务队列
            const handle = () => {
                queue.map( h => {
                    h(data);
                } );
            }
            queue.length > 0 ? handle() : ''; 
        }
        [handleQueues](thenable,catchable){
            const taskWraper = (data,task,resolve,reject) => {
                // 对task进行封装
                function link(){
                     this.then( d => {
                         resolve(d)
                     }, m => {
                         reject(m);
                     })
                }
                try{
                    if(!task){
                        // 处理promise串联
                        link.call(this);
                        return;
                    }
                    const result = task(data);
                    // 处理当result为Promise
                    result instanceof MyPromise ? link.call(result) : resolve(result)
                }catch(error){
                    reject(error.message);
                }
            }
            return new MyPromise((resolve,reject) => {
                // 处理thenable任务
                 this[handleTask]((data) => {
                     taskWraper(data,thenable,resolve,reject);
                 }, RESOLVED, this[thenables])
                // 处理catchables任务 
                 this[handleTask]((data) => {
                     taskWraper(data,catchable,resolve,reject);
                 }, REJECTED, this[catchables])
            })
        }
        [handleTask](handle,asyncStatu,queue){
            // 判断handle是否是函数。
            if(typeof handle !== 'function'){
                return ;
            }
           // 处理任务,把任务添加到任务队列中，或者立即执行
           const handleWraper = () => {
               // 把任务异步执行。
               setTimeout(() => handle(this[PromiseValue]),0)
           }
           this[PromiseStatu] === asyncStatu ? handleWraper() : queue.push(handle);
        }
    }
})({
PENDING: 'pending',
REJECTED: 'rejected',
RESOLVED: 'resolved',
PromiseValue: Symbol('PromiseValue'),
PromiseStatu: Symbol('PromiseStatu'),
ChangeStatu: Symbol('ChangeStatu'),
thenables: Symbol('thenables'),
catchables: Symbol('catchables'),
handleQueues: Symbol('handleQueues'),
handleTask: Symbol('handleTask'),
})

const p = new MyPromise( (resolve,reject) => {
 Math.random()< 0.5 ? resolve('亮哥贼帅') : reject('师姐这么大我想去看看')
})

p.then(m=>{
 console.log(m+'myPromise');
}, error => {
 console.log(error)
}).then( error => {
 console.log(error);
})
p.then().then(res => console.log(res+'hahaha'));

console.log("====================");

const p1 = new Promise( (resolve,reject) => {
 Math.random()< 0.5 ? resolve('亮哥贼帅') : reject('师姐这么大我想去看看')
})
console.log("====================");
p1.then(m=>{
console.log(m);
}, error => {
 console.log(error)
}).then( msg => {
 console.log(msg);
})


