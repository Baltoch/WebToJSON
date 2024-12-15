/**
 * ## /!\ This is a test function built to test the sidepanel outside of the extension
 * Loads a file from the chrome file system
 * @param {string} path The path to the file
 * @returns {Promise<string>} The content of the file
 */
export default async function loadChromeFile(path) {
    return await `This is the content of the file: ${path}`;
}