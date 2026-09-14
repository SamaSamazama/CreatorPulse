chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getAuthToken') {
    chrome.storage.local.get(['apiKey'], (result) => {
      sendResponse({ token: result.apiKey || null });
    });
    return true;
  }
  if (message.action === 'openAuth') {
    chrome.tabs.create({ url: 'http://localhost:3000/sign-in' });
    sendResponse({ opened: true });
    return true;
  }
});
