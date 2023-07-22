
import { openPage } from './utils'

// chrome.contextMenus.create({
//   id: "id",
// 	title: "title",
//   contexts: ["action"]
// });


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
