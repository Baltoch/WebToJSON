// Send the webpage content to the agent
window.onload = () => {
    chrome.runtime.sendMessage({ type: 'WebPageContent', content: document.body.outerHTML });
};