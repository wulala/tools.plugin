let captureInfo = {
    base64: [],
}

let toolbar = document.createElement('five-toolbar')
toolbar.classList.add(`__five-toolbar`)
let btnCapture = document.createElement('five-capture')
btnCapture.classList.add(`__five-btn`, `__five-capture`)
btnCapture.innerText = 'capture'
btnCapture.addEventListener('click', (e) => {
    if (selectElem) start(selectElem)
})
toolbar.appendChild(btnCapture)
document.querySelector('body').appendChild(toolbar)

var img = document.createElement('img')
img.className = '__xx'
document.querySelector('body').appendChild(img)

let cover = document.createElement('five-cover')
cover.classList.add('__five-cover')

/**
 * ---------------------------选择dom元素开始-------------------------------
 */

let blockElem = null // 鼠标移入元素
let selectElem = null // 选中元素

document.body.addEventListener('mouseover', over, false)
document.body.addEventListener('mouseout', out, false)
document.body.addEventListener('click', click, false)

function over(e) {
    if (e.target.classList.value.indexOf('__five') != -1) return console.log('我是插件元素')

    blockElem = findClosestBlockElement(e.target)
    if (selectElem) return console.log('已经有选中元素了，因为要对选中元素编辑')
    if (!blockElem) return console.log('没有找到block元素')
    // blockElem.classList.add('__hover')

    let rect = blockElem.getBoundingClientRect()

    cover.style.transform = `translate(${rect.x}px, ${rect.y})`
    blockElem.appendChild(cover)
}
function out(e) {
    if (selectElem == blockElem) return console.log('当前已选中，要保留选中状态哦')
    // blockElem.classList.remove('__hover')
    blockElem.removeChild(cover)
}
function click(e) {
    e.stopPropagation()
    e.preventDefault()

    // 如果已选中，再次点击
    if (selectElem == blockElem) {
        selectElem = null
        // blockElem.classList.remove('__hover')
        blockElem.removeChild(cover)
        return
    }
    // 没过没选中
    if (selectElem) {
        // selectElem.classList.remove('__hover')
        selectElem.removeChild(cover)
    }
    selectElem = blockElem
    // blockElem.classList.add('__hover')
    blockElem.appendChild(cover)
}
// 判断元素本身是否为块级元素
function isBlockElement(element) {
    const computedStyle = window.getComputedStyle(element)
    const displayValue = computedStyle.getPropertyValue('display')
    return (
        displayValue === 'block' ||
        displayValue === 'inline-block' ||
        displayValue === 'list-item' ||
        displayValue === 'table' ||
        displayValue === 'table-cell' ||
        displayValue === 'flex' ||
        displayValue === 'inline-flex' ||
        displayValue === 'grid' ||
        displayValue === 'inline-grid'
    )
}
// 查找具有块级显示属性的最近父元素,(找块元素)
function findClosestBlockElement(element) {
    if (isBlockElement(element)) return element
    if (element.parentElement) return findClosestBlockElement(element.parentElement)
    return null
}

/**
 * ---------------------------选择dom元素完成-------------------------------
 */

function start(elem) {
    // reset
    captureInfo = { base64: [] }

    // 获取当前浏览器的宽高滚动条高度
    let { clientWidth, clientHeight, scrollTop } = document.documentElement

    // 获取元素信息
    let rectInfo = elem.getBoundingClientRect()

    // 滚动到顶部， 让要截图的的元素出现在屏幕中...
    // 在先有的滚动条基础上， 移动rectinfo.y的距离
    document.documentElement.scrollTo(0, scrollTop + rectInfo.y)

    // 滚动完，更新一下位置信息
    rectInfo = elem.getBoundingClientRect()

    // todo:
    // 如果有横向滚动，元素可能不在屏幕内

    captureInfo = {
        rect: rectInfo, // 保存坐标信息，用来截图
        times: Math.ceil(rectInfo.height / clientHeight), // 需要滚动的次数
        current: 1, // 当前滚动第几次
        windowH: clientHeight,
        windowW: clientWidth,
        base64: [],
    }

    handlerDom()

    // 因为处理DOM元素内部有延迟...
    // setTimeout(capture, 100)
}

/**
 * 处理页面
 */
function handlerDom() {
    // 隐藏 __hover
    // selectElem.classList.remove('__hover')
    // blockElem.classList.remove('__hover')

    selectElem.removeChild(cover)
    blockElem.removeChild(cover)

    document.querySelectorAll('*').forEach((element) => {
        //

        // 隐藏 fixed 元素
        var position = window.getComputedStyle(element).getPropertyValue('position')
        if (position == 'fixed') {
            // 除了它自身以外，所有fixed元素都先隐藏
            if (element != selectElem) element.classList.add('__five-fixed-hide')
        }
        // 粘性定位暂停
        if (position == 'sticky') element.classList.add('__five-fixed-to-relative')

        // 隐藏所有滚动条
        document.body.classList.add('__five-scroll-hide')
        let overflow = window.getComputedStyle(element).getPropertyValue('overflow')
        let overflowX = window.getComputedStyle(element).getPropertyValue('overflow-x')
        let overflowY = window.getComputedStyle(element).getPropertyValue('overflow-y')
        if (overflow == 'auto' || overflow == 'scroll' || overflowX == 'auto' || overflowX == 'scroll' || overflowY == 'auto' || overflowY == 'scroll') {
            element.classList.add('__five-scroll-hide')
        }
    })
}

function capture() {
    chrome.runtime.sendMessage({ toBackground: '?' }, (res) => {
        captureInfo.base64.push(res)
        next()
    })

    return
}

function next() {
    if (captureInfo.current >= captureInfo.times) return complete()

    captureInfo.current += 1

    let body = document.documentElement

    let { clientWidth, clientHeight, scrollTop } = body

    // 滚动到下一屏
    body.scrollTo(0, scrollTop + clientHeight)

    // https://developer.chrome.com/docs/extensions/reference/tabs/#property-MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND ... 一秒只能调用两次
    setTimeout(capture, 1000 / 2)
}

async function complete() {
    let { rect, base64, windowH, windowW } = captureInfo
    let canvas = document.createElement('canvas')

    canvas.width = rect.width
    canvas.height = rect.height

    let context = canvas.getContext('2d')

    for (let index = 0; index < base64.length; index++) {
        let item = base64[index]
        let img = new Image()
        img.src = item
        await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
        })
        context.drawImage(img, rect.x, -rect.y, rect.width, rect.height, 0, windowH * index, rect.width, rect.height)
    }

    // canvas.toBlob((blob) => {
    //     const url = URL.createObjectURL(blob)

    //     img.onload = () => {
    //         // no longer need to read the blob so it's revoked
    //         // URL.revokeObjectURL(url)
    //     }

    //     img.src = url
    //     document.querySelector('body').appendChild(img)
    // })

    document.querySelector('body').appendChild(canvas)
}

function scroll(e) {
    e.stopPropagation()
    e.preventDefault()
}
