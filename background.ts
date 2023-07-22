
import { openPage } from './utils'

const menuList: (chrome.contextMenus.CreateProperties & { action?(tab: chrome.tabs.Tab): void })[] = [
  {
    id: "bookmark-manager",
    title: "书签管理",
    contexts: ["action"],
    action() {
      chrome.tabs.create({
        url: "./tabs/manager.html"
      })
    }
  },
  {
    id: "bookmark-setting",
    title: "书签设置",
    contexts: ["action"],
    action() {
      chrome.tabs.create({
        url: "./tabs/setting.html"
      })
    }
  },
  {
    id: "page-mark",
    title: "收藏该网页至 easy-bookmark",
    contexts: ["page"]
  },
  {
    id: "image-mark",
    title: "收藏选中图片至 easy-bookmark",
    contexts: ["image"]
  },
  {
    id: "text-mark",
    title: "收藏选中文本至 easy-bookmark",
    contexts: ["selection"]
  },
]

menuList.forEach(item => {
  const { action, ...menuProps } = item
  chrome.contextMenus.create(menuProps);
})


chrome.contextMenus.onClicked.addListener((info, tab) => {
  const { menuItemId } = info
  const menu = menuList.find(item => item.id === menuItemId)
  if (!menu) return
  const { action } = menu
  action && action(tab)
});


/** 监听图标点击 */
chrome.action.onClicked.addListener(async activeTab => {
  openPage('./tabs/manager.html', {
    width: 1000,
    height: 700,
  })
});

/** 监听创建书签的事件 */
chrome.bookmarks.onCreated.addListener(async bookmark => {
  openPage(`./tabs/remark.html?id=${bookmark}`, {
    width: 600,
    height: 700,
  })
});
