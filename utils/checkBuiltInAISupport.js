/**
 * Checks if the browser supports the AI Origin Trial API
 * @returns {boolean} false if the browser does not support the AI Origin Trial API, true otherwise
 */
export default async function checkBuiltInAISupport() {
    // Checking if the browser supports the AI Origin Trial API
    if (!('aiOriginTrial' in chrome)) {
        return false;
    }
    else {
        return true;
    }
}