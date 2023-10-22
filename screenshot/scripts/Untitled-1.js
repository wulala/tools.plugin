


// 保存原生的addEventListener方法
const originalAddEventListener = EventTarget.prototype.addEventListener

// 自定义addEventListener方法
EventTarget.prototype.addEventListener = function (type, listener, options) {

    // 右键事件,不做处理
    if (type === 'contextmenu') return

    // 其他正常事件,调用原生方法
    originalAddEventListener.call(this, type, listener, options)

}

// 处理已绑定的contextmenu事件
document.oncontextmenu = () => true


// 循环处理动态添加的元素, 一些滚动加载的页面
setInterval(() => {
    document.querySelectorAll('*').forEach(element => element.oncontextmenu = () => true)
}, 200)








// 限制跟解除限制

/**

// 保存原生的 addEventListener 方法
const originalAddEventListener = EventTarget.prototype.addEventListener;

// 定义变量控制是否恢复限制
let enableRestore = false;

// 自定义的 addEventListener 方法
EventTarget.prototype.addEventListener = function(type, listener, options) {

  // 检查是否需要恢复限制
  if(enableRestore) {
    // 恢复右键限制
    document.addEventListener('contextmenu', e => e.preventDefault());
  
  } else if(type === 'contextmenu') {
    // 右键事件,不做处理
  
  } else {  
    // 调用原生方法处理其他正常事件
    originalAddEventListener.apply(this, arguments);
  }

};

// 处理已绑定的 contextmenu 事件
document.oncontextmenu = function() {
  
  if(!enableRestore) {
    return true;
  }
  
};

// 循环处理动态添加的元素
setInterval(() => {

  document.querySelectorAll('*').forEach(element => {

    if(enableRestore) {
      // 恢复元素的右键限制
      element.addEventListener('contextmenu', e => e.preventDefault());
    
    } else {
      // 移除元素的右键限制  
      element.oncontextmenu = () => true;
    }

  });

}, 200);


// 按钮点击恢复限制
document.querySelector('#restore-btn').addEventListener('click', () => {
  enableRestore = true;
});

**/