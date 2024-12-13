/**
 * Gets the availability status of the built-in language model
 * @returns {Promise<string>} The availability status of the built-in language model
 */
export default async function getBuiltInLanguageModelAvailability() {
    return await chrome.aiOriginTrial.languageModel.capabilities().available;
}