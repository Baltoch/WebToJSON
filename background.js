chrome.runtime.onInstalled.addListener(() => {
    console.log('Web Scraper extension installed');
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
