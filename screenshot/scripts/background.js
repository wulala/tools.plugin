// 已经注入的tab列表
let insertTabs = []

// 确定采用chrome.debugger 方式不行。因为会有个弹窗

chrome.action.onClicked.addListener(async (tab) => {
    // if (insertTabs.includes(tab.id)) {
    //     // 已经注入就不操作了
    //     return console.log('已经启用')
    // }

    await chrome.scripting.insertCSS({
        files: ['styles/content.css'],
        target: { tabId: tab.id },
    })
    await chrome.scripting.executeScript({
        files: ['scripts/content.js'],
        target: { tabId: tab.id },
    })
    insertTabs.push(tab.id)
})

// addListener方法不能加async
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    // 傻逼谷歌
    // https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await
    ;(async () => {
        // 可视区域截图
        const visible = await chrome.tabs.captureVisibleTab({ format: 'png' })
        sendResponse(visible)
    })()

    return true
})
