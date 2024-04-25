

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

/** 监听图标点击 */
chrome.action.onClicked.addListener(async activeTab => {
  console.log('activeTab: ', activeTab);
});

/** 监听创建书签的事件 */
chrome.bookmarks.onCreated.addListener(async bookmark => {
  
});


// chrome.runtime.connect()

chrome.runtime.onMessage.addListener(async (params, sender, sendResponse) => {
  if (params.action === MessageActionEnum.GET_BOOKMARK_TREE) {
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      sendResponse(bookmarkTreeNodes);
    });
    return
  }
  if (params.action === MessageActionEnum.CREATE_BOOKMARK) {
    chrome.bookmarks.create(params.payload).then(res => {
      sendResponse(res)
    })
    return
  }
  if (params.action === MessageActionEnum.UPDATE_BOOKMARK) {
    const { id, ...rest } = params.payload
    chrome.bookmarks.update(id, rest).then(res => {
      sendResponse(res)
    })
    return
  }
  if (params.action === MessageActionEnum.MOVE_BOOKMARK) {
    const { id, url, title, parentId, index } = params.payload
    await chrome.bookmarks.update(id, { url, title })
    const res = await chrome.bookmarks.move(id, { parentId, index })
    sendResponse(res)
    return
  }
});