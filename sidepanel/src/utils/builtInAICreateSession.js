/**
 * ## /!\ This is a test function built to test the sidepanel outside of the extension
 * Creates a new session with the built-in AI
 * @param {Object} options The options for the session
 * @returns {Promise<Object>} The session
 */
export default async function builtInAICreateSession(options) {
    let sampleSession = { prompt: "Hello World" };
    sampleSession = { ...sampleSession, ...options, prompt: function (prompt) { return `This is a response from the built-in AI to the prompt: ${prompt}` } };
    return sampleSession;
}