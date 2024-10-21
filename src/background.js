chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ dayWorkTime: 8 });
});
