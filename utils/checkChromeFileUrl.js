/**
 * Checks if a file exists in the chrome file system
 * @param {string} path The path to the file
 * @returns {boolean} true if the file exists, false otherwise
 */
export default function checkChromeFileUrl(path) {
    if (chrome.runtime.getURL(`sidepanel/${path}`) != null) {
        return true;
    }
    else {
        return false;
    }
}
