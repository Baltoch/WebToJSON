/**
 * Adds a listener to the chrome runtime message event
 * @param {function (request: any, sender: any, sendResponse: any): Promise<void>} functionToCall(request, sender, sendResponse) The function to call when a message is received
 */
export default function addChromeMessageListener(functionToCall) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => functionToCall(request, sender, sendResponse));
}