

import { MessageActionEnum } from './utils'



/** 定义右键菜单列表 */
const menuList: (chrome.contextMenus.CreateProperties & { action?(tab: chrome.tabs.Tab): void })[] = [
  {
    id: "issues",
    title: "功能申请 && 问题反馈",
    contexts: ["action"],
    action() {
      chrome.tabs.create({ url: "https://github.com/Dolov/chrome-easy-bookmark/issues" })
    }
  },
  {
    id: "setting",
    title: "个性化设置",
    contexts: ["action"],
    action() {
      chrome.tabs.create({ url: "./tabs/Settings.html" })
    }
  },
]

/** 创建右键菜单 */
menuList.forEach(item => {
  const { action, ...menuProps } = item
  chrome.contextMenus.create(menuProps);
})

/** 监听右键菜单的点击事件，执行对应的行为 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const { menuItemId } = info
  const menu = menuList.find(item => item.id === menuItemId)
  if (!menu) return
  const { action } = menu
  action && action(tab)
});



/** 监听创建书签的事件 */
chrome.bookmarks.onCreated.addListener(async bookmark => {

});


// chrome.runtime.connect()

/** 监听图标点击 */
chrome.action.onClicked.addListener(async activeTab => {
  // 发送消息到内容脚本
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: MessageActionEnum.ACTION_ON_CLICKED,
      payload: activeTab
    }, function (response) {
      if (!chrome.runtime.lastError) return
      chrome.tabs.create({ url: `./tabs/Manage.html` })
    });
  });
});

chrome.commands.onCommand.addListener((command, tab) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const { url, title } = tabs[0]
    chrome.tabs.sendMessage(tabs[0].id, {
      action: MessageActionEnum.COMMAND,
      payload: {
        ...tab,
        command,
      }
    }, function (response) {
      if (!chrome.runtime.lastError) return
      const typeMap = {
        "create-or-edit": "Create",
        "manage-or-search": "Manage",
      }
      chrome.tabs.create({ url: `./tabs/${typeMap[command]}.html?url=${url}&title=${title}` })
    })
  });
})


/**
 * 1. 不能使用 async/await，否则会导致 onMessage 事件无法响应
 * 2. 必须 return true，否则会导致 onMessage 事件无法响应
 */
chrome.runtime.onMessage.addListener((params, sender, sendResponse) => {
  if (params.action === MessageActionEnum.BOOKMARK_GET_TREE) {
    chrome.bookmarks.getTree(bookmarkTreeNodes => {
      sendResponse(bookmarkTreeNodes);
    });
    return true
  }

  if (params.action === MessageActionEnum.BOOKMARK_CREATE) {
    chrome.bookmarks.create(params.payload).then(res => {
      sendResponse(res)
    })
    return true
  }
  if (params.action === MessageActionEnum.BOOKMARK_UPDATE) {
    const { id, ...rest } = params.payload
    chrome.bookmarks.update(id, rest).then(res => {
      sendResponse(res)
    })
    return true
  }
  if (params.action === MessageActionEnum.BOOKMARK_MOVE) {
    const { id, url, title, parentId, index } = params.payload
    chrome.bookmarks.update(id, { url, title }).then(res => {
      chrome.bookmarks.move(id, { parentId, index }).then(res => {
        sendResponse(res)
      })
    })
    return true
  }
  if (params.action === MessageActionEnum.BOOKMARK_REMOVE) {
    chrome.bookmarks.remove(params.id).then(res => {
      sendResponse(res)
    })
    return true
  }
  if (params.action === MessageActionEnum.BOOKMARK_REMOVE_TREE) {
    chrome.bookmarks.removeTree(params.id).then(res => {
      sendResponse(res)
    })
    return true
  }
});
