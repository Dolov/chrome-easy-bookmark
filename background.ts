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



chrome.action.onClicked.addListener(activeTab => {
  chrome.tabs.create({ url: "./tabs/manager.html" });
});



chrome.bookmarks.onCreated.addListener(function(bookmark) {
  // 自定义处理逻辑
  console.log('用户收藏了一个网页');
  console.log(bookmark);
});
