

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

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // 处理消息
  if (message.action === MessageActionEnum.GET_BOOK_MARK_TREE) {
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      sendResponse(bookmarkTreeNodes);
    });
  }
});