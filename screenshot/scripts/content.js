let captureInfo = {
    base64: [],
}

let overCover = null // 鼠标移入的覆盖层（用于标记选中的区域）
let nodeCover = null // 鼠标选中的元素的提示层
let toPicBtn = null // 生成按钮

let overElem = null // 鼠标移入块元素
let selectElem = null // 选中元素
let elemParentOfBody = null // 查找鼠标移入/选中元素的父级（查找到body子元素层级

// ----------------------------- 工具条插入 start -----------------------------
let toolbar = document.createElement('five-toolbar')
toolbar.innerHTML = `
<five-tool class="__five-tool">
    <five-btn class="__five-select">
    <svg viewBox="0 0 1024 1024">
        <path
            d="M990.691556 731.847111L1024 688.967111 577.550222 342.101333 848.298667 71.352889 0 0.839111l70.513778 848.312889 261.034666-261.048889 355.328 435.057778 42.069334-34.346667-393.329778-481.592889L114.944 727.907556 59.434667 60.273778 727.068444 115.768889 495.630222 347.221333z"
        ></path>
    </svg>
    </five-btn>
    <five-btn class="__five-generate">
    <svg viewBox="0 0 1024 1024">
        <path
            d="M779.7 588.6c-23.2 0-45.3 4.4-65.7 12.5L282.9 108.3c-10.2-11.6-27.9-12.8-39.5-2.6-11.6 10.2-12.8 27.9-2.6 39.5l424.4 485.1c-39.3 32.8-64.3 82.2-64.3 137.2 0 98.6 80.2 178.8 178.8 178.8 98.6 0 178.8-80.2 178.8-178.8s-80.2-178.9-178.8-178.9z m0 301.7c-67.7 0-122.8-55.1-122.8-122.8 0-67.7 55.1-122.8 122.8-122.8 67.7 0 122.8 55.1 122.8 122.8 0 67.7-55.1 122.8-122.8 122.8z"
        ></path>
        <path
            d="M779.7 105.6c-11.6-10.2-29.3-9-39.5 2.6L309 601.1c-20.3-8.1-42.5-12.5-65.7-12.5-98.6 0-178.8 80.2-178.8 178.8s80.2 178.8 178.8 178.8c98.6 0 178.8-80.2 178.8-178.8 0-55.1-25-104.4-64.3-137.2l424.4-485.1c10.3-11.6 9.1-29.3-2.5-39.5zM243.4 890.3c-67.7 0-122.8-55.1-122.8-122.8 0-67.7 55.1-122.8 122.8-122.8 67.7 0 122.8 55.1 122.8 122.8 0 67.7-55.1 122.8-122.8 122.8z"
        ></path>
    </svg>
    </five-btn>
    <five-btn class="__five-exit">
    <svg viewBox="0 0 1024 1024">
        <path
            d="M559.786667 512l314.026666-314.026667c13.653333-13.653333 13.653333-34.133333 0-47.786666-13.653333-13.653333-34.133333-13.653333-47.786666 0L512 464.213333 197.973333 150.186667c-13.653333-13.653333-34.133333-13.653333-47.786666 0-13.653333 13.653333-13.653333 34.133333 0 47.786666l314.026666 314.026667-314.026666 314.026667c-13.653333 13.653333-13.653333 34.133333 0 47.786666 13.653333 13.653333 34.133333 13.653333 47.786666 0l314.026667-314.026666 314.026667 314.026666c13.653333 13.653333 34.133333 13.653333 47.786666 0 13.653333-13.653333 13.653333-34.133333 0-47.786666L559.786667 512z"
        ></path>
    </svg>
    </five-btn>
</five-tool>
<five-cover class="__five-cover"></five-cover>
<five-node class="__five-node"></five-node>
`
document.body.appendChild(toolbar)

// 初始化截图工具
document.querySelector('.__five-select').addEventListener('click', (e) => {
    if (e.target.classList.contains('__five-on')) return console.log('已经启用选择了')

    e.target.classList.add('__five-on')

    // 移除所有事件
    let body = document.documentElement
    let clonedElement = body.cloneNode(true)
    body.parentNode.replaceChild(clonedElement, body)

    // 移除所有hover效果
    removeHover()

    // 获取元素
    overCover = document.querySelector('.__five-cover')
    nodeCover = document.querySelector('.__five-node')
    toPicBtn = document.querySelector('.__five-generate')

    //  重新添加事件
    document.querySelector('.__five-exit').addEventListener('click', (e) => {
        location.reload()
    })

    toPicBtn.addEventListener('click', (e) => {
        if (!selectElem) return

        start()
    })

    // 添加选择事件
    document.body.addEventListener('mouseover', over, false)
    document.body.addEventListener('click', click, false)
})

// 退出截图工具
document.querySelector('.__five-exit').addEventListener('click', (e) => {
    if (document.querySelector('.__five-select').classList.contains('__five-on')) {
        return location.reload()
    }
    document.body.removeChild(toolbar)
})

/**
 * 鼠标移入元素
 * @param {*} e
 * @returns
 */
function over(e) {
    if (e.target.classList.value.indexOf('__five') != -1) {
        overCover.classList.remove(`__five-show`)
        return console.log('插件元素不可被选择')
    }

    overElem = findClosestBlockElement(e.target)
    if (!overElem) return console.log('没有找到block元素')

    let rect = overElem.getBoundingClientRect()
    overCover.style.transform = `translate(${rect.x}px, ${rect.y}px)`
    overCover.style.width = `${rect.width}px`
    overCover.style.height = `${rect.height}px`
    overCover.classList.add(`__five-show`)
}

/**
 * 选中元素
 * @param {*} e
 * @returns
 */
function click(e) {
    e.preventDefault()

    if (e.target.classList.value.indexOf('__five') != -1) return console.log('插件元素不可被选择')
    if (!overElem) return console.log('没有找到block元素')

    if (selectElem == overElem) {
        selectElem = null
        toPicBtn.classList.remove('__five-can')
        nodeCover.classList.remove(`__five-show`)
        return
    }

    selectElem = overElem
    toPicBtn.classList.add('__five-can')

    let rect = overElem.getBoundingClientRect()
    nodeCover.style.transform = `translate(${rect.x}px, ${rect.y}px)`
    nodeCover.style.width = `${rect.width}px`
    nodeCover.style.height = `${rect.height}px`
    nodeCover.classList.add(`__five-show`)
}

/**
 * 开始截图
 * @param {*} elem
 */
function start() {
    // reset
    captureInfo = { base64: [] }

    // 获取当前浏览器的宽高滚动条高度
    let { clientWidth, clientHeight, scrollTop } = document.documentElement

    handlerDom()

    // 滚动完，更新一下位置信息
    rectInfo = selectElem.getBoundingClientRect()

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

    // 因为处理DOM元素内部有延迟...
    setTimeout(capture, 250)
}

/**
 * 处理dom元素
 */
function handlerDom() {
    // 隐藏插件元素
    toolbar.classList.add('__five-hide')
    overCover.classList.add('__five-hide')
    nodeCover.classList.add('__five-hide')

    document.querySelectorAll('*').forEach((element) => {
        // 隐藏 fixed 元素， 避免滚动截图时候会有fixed元素遮挡
        var position = window.getComputedStyle(element).getPropertyValue('position')
        if (position == 'fixed') {
            // 除了它自身以外，所有fixed元素都先隐藏
            if (element != selectElem) element.classList.add('__five-hide')
        }
        // 粘性定位暂停
        if (position == 'sticky') element.classList.add('__five-relative')

        // 隐藏所有滚动条
        element.classList.add('__five-scroll-hide')
    })

    // 获取元素信息
    let rectInfo = selectElem.getBoundingClientRect()

    let scrollElem = findClosestScrollElement(selectElem)

    // 滚动到顶部， 让要截图的的元素出现在屏幕中...
    // 在先有的滚动条基础上， 移动rectinfo.y的距离
    document.documentElement.scrollTo(0, scrollTop + rectInfo.y)
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

function out(e) {
    if (e.target.classList.value.indexOf('__five') != -1) return console.log('mouseout, 我是插件元素')
    if (selectElem == overElem) return console.log('当前已选中，要保留选中状态哦')
    cover.classList.remove(`__five-show`)
}

// ---------------------------------------辅助函数 start-------------------------------------------------------------

// 判断元素本身是否为块级元素
function isBlockElement(element) {
    const computedStyle = window.getComputedStyle(element)
    const displayValue = computedStyle.getPropertyValue('display')
    return ['block', 'inline-block', 'list-item', 'table', 'table-cell', 'flex', 'inline-flex', 'grid', 'inline-grid'].includes(displayValue)
}
// 查找具有块级显示属性的最近父元素,(找块元素)
function findClosestBlockElement(element) {
    if (isBlockElement(element)) return element
    if (element.parentElement) return findClosestBlockElement(element.parentElement)
    return null
}

// 判断元素本身是否为可滚动元素
function isScrollElement(element) {
    const computedStyle = window.getComputedStyle(element)
    // todo: 目前只判断纵向滚动
    const overflowYValue = computedStyle.getPropertyValue('overflow-y')
    return ['auto', 'scroll'].includes(overflowYValue)
}

function findClosestScrollElement(element) {
    if (isBlockElement(element)) return element
    if (element.parentElement) return findClosestScrollElement(element.parentElement)
    return null
}

/**
 * 移除所有元素的hover伪类样式
 */
function removeHover() {
    document.querySelectorAll('*').forEach((element) => {
        const computedStyle = window.getComputedStyle(element)
        const originalStyle = computedStyle.getPropertyValue('style')
        const hoverStyle = computedStyle.getPropertyValue('hover')

        if (hoverStyle !== 'none') {
            element.style.setProperty('style', originalStyle)
        }
    })
}

function findParent(elem) {
    // parentElement 在找根节点会报错，parentNode会返回 document
    const body = document.body
    let parent = elem.parentElement
    if (parent == body) return elem
    return findParent(parent)
}

// ---------------------------------------辅助函数 end------------------------------------------------------
