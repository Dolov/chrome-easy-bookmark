

import { MessageActionEnum } from './utils'

/** 定义右键菜单列表 */
const menuList: (chrome.contextMenus.CreateProperties & { action?(tab: chrome.tabs.Tab): void })[] = [
  {
    id: "bookmark-manager",
    title: "书签管理",
    contexts: ["action"],
    action() {

    }
  },
  {
    id: "bookmark-setting",
    title: "书签设置",
    contexts: ["action"],
    action() {

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
    });
  });
});

chrome.commands.onCommand.addListener((command, tab) => {
  // 发送消息到内容脚本
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: MessageActionEnum.COMMAND,
      payload: {
        ...tab,
        command,
      }
    }, function (response) {
    });
  });
})

chrome.runtime.onMessage.addListener(async (params, sender, sendResponse) => {
  if (params.action === MessageActionEnum.BOOKMARK_GET_TREE) {
    chrome.bookmarks.getTree(bookmarkTreeNodes => {
      sendResponse(bookmarkTreeNodes);
    });
    return
  }
  if (params.action === MessageActionEnum.BOOKMARK_CREATE) {
    const res = await chrome.bookmarks.create(params.payload)
    sendResponse(res)
    return
  }
  if (params.action === MessageActionEnum.BOOKMARK_UPDATE) {
    const { id, ...rest } = params.payload
    const res = await chrome.bookmarks.update(id, rest)
    sendResponse(res)
    return
  }
  if (params.action === MessageActionEnum.BOOKMARK_MOVE) {
    const { id, url, title, parentId, index } = params.payload
    await chrome.bookmarks.update(id, { url, title })
    const res = await chrome.bookmarks.move(id, { parentId, index })
    sendResponse(res)
    return
  }
  if (params.action === MessageActionEnum.BOOKMARK_DELETE) {
    const res = await chrome.bookmarks.remove(params.id)
    sendResponse(res)
    return
  }
});