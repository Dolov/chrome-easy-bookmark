import { Storage } from "@plasmohq/storage"
import { openPage, Namespace, initialSettings } from './utils'

const storage = new Storage()

/** 定义右键菜单列表 */
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


let lastWindow: chrome.windows.Window
/** 监听图标点击 */
chrome.action.onClicked.addListener(async activeTab => {
  const settings = await storage.get(Namespace.SETTINGS) as any || initialSettings
  if (!settings) return
  const { showType, width, height } = settings
  if (showType === "modal") {
    // 只有 url 存在，才能通过 content_script 的方式打开
    if (activeTab.url) {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "open"
        });
      });
      return
    }
    // 在无法注入 content_script 的页面通过打开新窗口来展示
    openPage('./tabs/manager.html', {
      width,
      height,
    })
    return
  }

  if (showType === "window") {
    if (lastWindow) {
      try {
        const win = await chrome.windows.get(lastWindow.id)
        await chrome.windows.update(win.id, {
          focused: true
        })
        return
      } catch (error) {
        // 被捕获到异常说明页面已经被销毁
      }
    }
    lastWindow = await openPage('./tabs/manager.html', {
      width,
      height,
    })
  }
});

/** 监听创建书签的事件 */
chrome.bookmarks.onCreated.addListener(async bookmark => {
  openPage(`./tabs/remark.html?id=${bookmark}`, {
    width: 600,
    height: 700,
  })
});
