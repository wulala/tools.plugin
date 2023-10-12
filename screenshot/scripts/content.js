let scrollElemInfo = {
    elem: document.body, // 滚动元素
    scrolltimes: 1, // 滚动次数
    scrollnow: 0, // 当前滚动次
    divH: 0, // 元素高度
}

let captureInfo = {
    base64: [],
}

let screenShotArr = []

var btn = document.createElement('button')
btn.innerText = '点击按钮哦'
btn.style.position = 'fixed'
btn.style.zIndex = 9999
btn.style.top = 0
btn.style.left = 0

var img = document.createElement('img')
img.className = '__xx'

document.querySelector('body').appendChild(btn)

btn.addEventListener('click', (e) => {
    start(document.querySelector('.__test'))
})

function start(elem) {
    // reset
    captureInfo = { base64: [] }

    // 获取当前浏览器的宽高滚动条高度
    let { clientWidth, clientHeight, scrollTop } = document.documentElement

    // 获取元素信息
    let rectInfo = elem.getBoundingClientRect()

    // 统一滚动到顶部， 好计算滚屏次数

    document.documentElement.scrollTo(0, scrollTop + rectInfo.y)

    // 滚动完，更新一下位置信息
    rectInfo = elem.getBoundingClientRect()

    captureInfo = {
        rect: rectInfo, // 保存坐标信息，用来截图
        times: Math.ceil(rectInfo.height / clientHeight), // 需要滚动的次数
        current: 1, // 当前滚动第几次
        windowH: clientHeight,
        base64: [],
    }

    // 开始截图
    capture()
}

function capture() {
    chrome.runtime.sendMessage({ toBackground: '?' }, (res) => {
        captureInfo.base64.push(res)
        next()
    })

    return
}

function next() {
    console.log(captureInfo, '-=-')

    if (captureInfo.current >= captureInfo.times) return complete()

    captureInfo.current += 1

    let body = document.documentElement

    let { clientWidth, clientHeight, scrollTop } = body

    // 滚动到下一屏
    body.scrollTo(0, scrollTop + clientHeight)

    // https://developer.chrome.com/docs/extensions/reference/tabs/#property-MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND ... 一秒只能调用两次
    setTimeout(capture, 1000 / 3)
}

function complete() {
    let canvas = document.createElement('canvas')
    canvas.width = captureInfo.width
    canvas.height = captureInfo.height * captureInfo.base64.length

    let context = canvas.getContext('2d')

    captureInfo.base64.forEach((item, index) => {
        let img = new Image()
        img.src = item
        context.drawImage(img, 0, captureInfo.windowH * index)
    })

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)

        img.onload = () => {
            // no longer need to read the blob so it's revoked
            URL.revokeObjectURL(url)
        }

        img.src = url
        document.querySelector('body').appendChild(img)
    })
}

/**
 * 查找元素本身或者最近的父元素是overflow-y: auto的元素
 * @param {*} element
 * @returns
 */
function findOverflowYElement(element) {
    if (!element || element == document.body) return document.body

    let overflowY = window.getComputedStyle(element).getPropertyValue('overflow-y')

    if (overflowY === 'auto' || overflowY === 'scroll') {
        return element
    }

    return findOverflowYElement(element.parentNode)
}

/**
 * 获取滚动元素的内容高度和div高度
 * @param {DOM} element
 */
function getScrollElementHeight(element) {
    let scrollElem = findOverflowYElement(element)

    scrollElemInfo.elem = scrollElem

    let contentH = scrollElem.scrollHeight // 总高度
    let divH = scrollElem.clientHeight // div设定的高度

    scrollElemInfo.scrolltimes = contentH == divH ? 1 : Math.ceil(contentH / divH)
    scrollElemInfo.divH = divH
}
