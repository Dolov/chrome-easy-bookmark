chrome.commands.onCommand.addListener(function(command) {
  if (command === 'helloworld') {
    // chrome.tabs.create({ url: 'https://www.github.com' });
    chrome.windows.create({
      type: "popup",
      width: 800,
      height: 600,
      url: 'https://www.github.com',
    });
  }
});

/** 监听图标点击 */
chrome.action.onClicked.addListener(activeTab => {
  chrome.tabs.create({ url: "./tabs/manager.html" });
});

/** 监听创建书签的事件 */
chrome.bookmarks.onCreated.addListener(bookmark => {
  /** 获取浏览器位于窗口的位置信息 */
  chrome.windows.getCurrent({ populate: true }, window => {
    const { width, height, left, top } =  window
    
    /** popop 的预设宽高 */
    const popopWidth = 600
    const popopHeight = 700
    /** 打开重新选择标签存储位置的页面 */
    chrome.windows.create({
      type: "popup",
      width: popopWidth,
      height: popopHeight,
      left: Math.floor(width / 2) + left - Math.floor(popopWidth / 2),
      top: top + 120,
      url: `./tabs/remark.html?id=${bookmark}`,
    });
  });
});
