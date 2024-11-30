// 获取 dom 元素
const fileInput = document.getElementById('fileInput')
const uploadImage = document.getElementById('uploadImage')
const imageWidthInput = document.getElementById('imageWidth')
const imageWidthValue = document.getElementById('imageWidthValue')
const enableTransparentColor = document.getElementById('enableTransparentColor')
const transparentColorInput = document.getElementById('transparentColor')
const transparentInput = document.getElementById('transparentInput')
const transparentValue = document.getElementById('transparentValue')
const colorListView = document.getElementById('colorList')
const editColorInput = document.getElementById('editColor')
const emptyText = document.getElementById('emptyText')
const copyTextButton = document.getElementById('copyText')
const copyTips = document.getElementById('copyTips')


const resultImage = document.getElementById('resultImage')

// const imageCanvas = document.getElementById('imageCanvas')
// const imageCtx = imageCanvas.getContext('2d')



// 颜色选项列表
let colorList = [
    '#FFFFFF', '#178BFF', '#CBCDCE', '#76736F', '#000000',
    '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',
    '#000000', '#FF8000', '#FFFFFF', '#FF0000', '#67D100',
    '#FFFFFF', '#168BFF', '#CFD1D2', '#767370', '#564200',
    '#000047', '#FFEEB9', '#FFFFFF', '#7E7F80', '#323538',
]

// 颜色对应的ID（游戏里颜色选项的ID）
const colorID = [
    '#000000', '#010101', '#020202', '#030303', '#040404', 
    '#050505', '#060606', '#070707', '#080808', '#090909', 
    '#0A0A0A', '#0B0B0B', '#0C0C0C', '#0D0D0D', '#0E0E0E', 
    '#0F0F0F', '#101010', '#111111', '#121212', '#131313', 
    '#141414', '#151515', '#161616', '#171717', '#181818',
]

// 当前选中的颜色索引
let activeColorIndex = 0

let imgData = null      // 原始图像数据
let newImgData = null   // 转换后图像数据
let resultCode = ""     // 转换结果代码

let imageWidth = 50             // 图像宽度
let enableTransparency = true   // 是否启用转透明
let transColor = [255,255,255]  // 透明颜色
let transThreshold = 80         // 透明阈值


// 画布缩放比例
let scale = 1




// 初始化UI
function initUI() {
    // 颜色转透明开关
    enableTransparentColor.checked = enableTransparency
    // 透明颜色输入框
    transparentColorInput.value = rgbToHex(transColor)
    // 颜色编辑框
    editColor.value = colorList[activeColorIndex]
}
initUI()




// 更新UI
function updateUI() {
    // 图像宽度滑条
    imageWidthInput.value = imageWidth
    const sizeValue = mapRange(imageWidth, 10, 300, 0, 100)
    imageWidthInput.style.backgroundSize = sizeValue + "% 100%"
    imageWidthValue.innerText = imageWidth
    // 透明阈值滑条
    transparentInput.value = transThreshold
    const transValue = mapRange(transThreshold, 0, 100, 0, 100)
    transparentInput.style.backgroundSize = transValue + "% 100%"
    transparentValue.innerText = transThreshold
}
updateUI()




// 选择图片监听器
fileInput.addEventListener('change', function (event) {
    if (event.target.files && event.target.files[0]) {
        const reader = new FileReader()
        reader.readAsDataURL(event.target.files[0])
        reader.onload = function (e) {
            imgData = e.target.result
            // 显示选择的图片
            uploadImage.src = imgData
            // 隐藏提示文本
            document.querySelector('.uploadImageBox .text').style.display = 'none'
            
            onTransition()
        }
    }
})




// 图像宽度滑条监听器
imageWidthInput.addEventListener('input', function() {
    imageWidth = this.value
    updateUI()
    onTransition()
})

// 颜色转透明复选框监听器
enableTransparentColor.addEventListener('change', function() {
    enableTransparency = this.checked
    onTransition()
})

// 透明颜色输入框监听器
transparentColorInput.addEventListener('input', function() {
    transColor = hexToRgb(this.value)
    onTransition()
})

// 透明阈值滑条监听器
transparentInput.addEventListener('input', function() {
    transThreshold = parseInt(this.value)
    updateUI()
    onTransition()
})




// 生成颜色选项
function drawColorItem() {
    // 清空选项
    colorListView.innerHTML = ""
    // 遍历颜色列表
    for (let i = 0; i < colorList.length; i++) {
        // 创建一个div元素
        let colorDiv = document.createElement('div')
        colorDiv.className = 'colorItem'
        colorDiv.setAttribute('data-index', i)
        colorDiv.style.backgroundColor = colorList[i]

        // 如果选项等于选中的索引，添加active类名
        if (i == activeColorIndex) colorDiv.classList.add('active')

        // 添加点击事件，点击后更新索引，重新生成选项
        colorDiv.addEventListener('click', function (){
            activeColorIndex = this.getAttribute('data-index')
            editColorInput.value = colorList[activeColorIndex]
            drawColorItem()
            onTransition()
        })

        // 把选项添加到布局中
        colorListView.appendChild(colorDiv)
    }
}
drawColorItem()


// 颜色编辑框监听器
editColorInput.addEventListener('input', function () {
    colorList[activeColorIndex] = this.value
    drawColorItem()
    onTransition()
})








// 开始转换
function onTransition() {
    if (imgData == null) return

    // 创建Image对象，储存图像数据
    const img = new Image()
    img.src = imgData
    // 图像加载完成后调用
    img.onload = function() {
        // 调整图片大小
        const resizedImage = resizeImage(img)

        // 读取图片像素，转换为单色
        newImgData = getImageRGB(resizedImage)

        // 显示转换后的图像预览
        resultImage.src = newImgData.toDataURL()
        resultImage.style.display = 'block'
        emptyText.style.display = 'none'
    }
}



// 点击复制代码按钮
copyTextButton.addEventListener('click', function () {
    if (imgData == null) return
    
    resultCode = `<size=0.5><line-height=0.298>`
    let index = 0

    // 开始和结束的标签
    const startLabel = `<color=${colorID[activeColorIndex]}>`
    const endLabel = `</color>`

    // 遍历转换后的数据
    const ctx = newImgData.getContext('2d')
    const imageData = ctx.getImageData(0, 0, newImgData.width, newImgData.height)
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i]
        const g = imageData.data[i + 1]
        const b = imageData.data[i + 2]
        const a = imageData.data[i + 3]
    
        // 判断是否在每一行的开头
        if (index % imageWidth === 0) {
            resultCode += startLabel
        }

        // 判断当前像素是实心还是透明
        if (a === 255) {
            resultCode += `a`
        } else {
            resultCode += `  `
        }

        // 判断是否在每一行的结尾
        if (index % imageWidth === imageWidth - 1) {
            resultCode += endLabel
            resultCode += `<br>\n`
        }
        index += 1
    }
    console.log(resultCode)
    // 复制代码到剪切板上
    copyText(resultCode)
})



// 把指定内容复制到剪切板上
function copyText(text){
    if (navigator.clipboard && text) {
        navigator.clipboard.writeText(text)
        copyTips.style.display = 'block'
        setTimeout(() => {
            copyTips.style.display = 'none'
        }, 1000)
    } else {
        console.log("复制失败")
    }
}




// 调整图像大小
function resizeImage(image) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const targetHeight = (imageWidth / image.width) * image.height
    canvas.width = imageWidth
    canvas.height = targetHeight
    ctx.drawImage(image, 0, 0, imageWidth, targetHeight)
    return canvas
}



// 读取图像的像素
function getImageRGB(canvas) {
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // 遍历数据，转换为单色数据
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i]
        const g = imageData.data[i + 1]
        const b = imageData.data[i + 2]
        const a = imageData.data[i + 3]

        // 检查颜色是否在阈值范围内
        let isInRange = transColor[0] - transThreshold <= r && r <= transColor[0] + transThreshold
        let isInRangeG = transColor[1] - transThreshold <= g && g <= transColor[1] + transThreshold
        let isInRangeB = transColor[2] - transThreshold <= b && b <= transColor[2] + transThreshold
        
        // 启用颜色转透明就把对应颜色替换为透明，如果关闭，就把非透明的颜色替换为指定颜色
        if (enableTransparency) {
            if (isInRange && isInRangeG && isInRangeB) {
                imageData.data[i] = 0
                imageData.data[i + 1] = 0
                imageData.data[i + 2] = 0
                imageData.data[i + 3] = 0    
            } else {
                const color = hexToRgb(colorList[activeColorIndex])
                imageData.data[i] = color[0]
                imageData.data[i + 1] = color[1]
                imageData.data[i + 2] = color[2]
                imageData.data[i + 3] = 255
            }
        } else {
            if (imageData.data[i + 3] > transThreshold) {
                const color = hexToRgb(colorList[activeColorIndex])
                imageData.data[i] = color[0]
                imageData.data[i + 1] = color[1]
                imageData.data[i + 2] = color[2]
                imageData.data[i + 3] = 255
            } else {
                imageData.data[i] = 0
                imageData.data[i + 1] = 0
                imageData.data[i + 2] = 0
                imageData.data[i + 3] = 0
            }
        }
    }

    // 把数据转换为canvas再返回
    const newCanvas = document.createElement('canvas')
    newCanvas.width = canvas.width
    newCanvas.height = canvas.height
    const newCtx = newCanvas.getContext('2d')
    newCtx.putImageData(imageData, 0, 0)

    return newCanvas
}






// 使用方法弹窗
const helpButton = document.getElementById('helpButton')
const helpDialog = document.getElementById('helpDialog')
const helpCloseButton = document.getElementById('helpCloseButton')

helpButton.addEventListener('click', function () {
    helpDialog.style.display = 'block'
})

helpCloseButton.addEventListener('click', function () {
    helpDialog.style.display = 'none'
})







// 映射数值范围
function mapRange(value, inMin, inMax, outMin, outMax) {
    const ratio = (value - inMin) / (inMax - inMin)
    const mapped = outMin + ratio * (outMax - outMin)
    return Math.min(outMax, Math.max(outMin, mapped))
}

// 十六进制转rgb
function hexToRgb(hex) {
    hex = hex.replace('#', '')
    var r = parseInt(hex.substring(0, 2), 16)
    var g = parseInt(hex.substring(2, 4), 16)
    var b = parseInt(hex.substring(4, 6), 16)
    return [r, g, b]
}

// rgb转十六进制
function rgbToHex(rgb) {
    const toHex = (value) => {
        const hex = value.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }
    return '#' + toHex(rgb[0]) + toHex(rgb[1]) + toHex(rgb[2]);
}