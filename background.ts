
import { openPage } from './utils'

const managerId = "bookmark-manager"
const settingId = "bookmark-setting"

chrome.contextMenus.create({
  id: managerId,
	title: "书签管理",
  contexts: ["action"]
});

chrome.contextMenus.create({
  id: settingId,
	title: "书签设置",
  contexts: ["action"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === managerId) {
    chrome.tabs.create({
      url: "./tabs/manager.html"
    })
  }
  if (info.menuItemId === settingId) {
    chrome.tabs.create({
      url: "./tabs/setting.html"
    })
  }
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
