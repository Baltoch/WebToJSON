/**
 * ## /!\ This is a test function built to test the sidepanel outside of the extension
 * Sends a message to the chrome extension
 * @param {string} message the message to send
 * @param {string} type Optional param to set the type of message (defaults to AgentMessage)
 */
export default function sendChromeMessage(message, type = "AgentMessage") {
    return { type: type, content: message };
}