/**
 * Creates a new session with the built-in AI
 * @param {Object} options The options for the session
 * @returns {Promise<Object>} The session
 */
export default async function builtInAICreateSession(options) {
    return await chrome.aiOriginTrial.languageModel.create(options);
}