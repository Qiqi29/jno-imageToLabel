let data = localStorage.getItem('resultCode')

const textarea = document.getElementById('imageData')

function setData() {
    textarea.value = data
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 10 + 'px'
}
setData()



function handleResize() {
    var newWidth = window.innerWidth
    console.log('窗口宽度变为: ' + newWidth + 'px')
    setData()
}

// 使用节流函数包装handleResize
const throttledHandleResize = throttle(handleResize, 100)

// 窗口宽度变化监听器
window.addEventListener('resize', throttledHandleResize)



// 节流函数
function throttle(func, limit) {
    let inThrottle
    return function () {
        const args = arguments
        const context = this
        if (!inThrottle) {
            func.apply(context, args)
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit)
        }
    }
}