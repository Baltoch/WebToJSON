/**
 * Loads a file from the chrome file system
 * @param {string} path The path to the file
 * @returns {Promise<string>} The content of the file
 */
export default async function loadChromeFile(path) {
    const url = chrome.runtime.getURL(`sidepanel/${path}`);
    const response = await fetch(url);
    return await response.text();
}