/**
 * ## /!\ This is a test function built to test the sidepanel outside of the extension
 * Adds a listener to the chrome runtime message event
 * @param {function (request: any, sender: any, sendResponse: any): Promise<void>} functionToCall The function to call when a message is received
 */
export default function addChromeMessageListener(functionToCall) {
    const sampleRequest = { type: "WebPageContent", content: "Hello World" };
    const sampleSender = { tab: { id: 1 } };
    const sampleSendResponse = function (response) {
        console.log(response);
    };
    functionToCall(sampleRequest, sampleSender, sampleSendResponse);
}