/**
 * Gets the capabilities of the built-in language model
 * @returns {Promise<Object>} The capabilities of the built-in language model
 */
export default async function getBuiltInLanguageModelCapabilities() {
    return await chrome.aiOriginTrial.languageModel.capabilities();
}