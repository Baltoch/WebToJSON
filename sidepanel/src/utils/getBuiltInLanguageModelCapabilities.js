/**
 * ## /!\ This is a test function built to test the sidepanel outside of the extension
 * Gets the capabilities of the built-in language model
 * @returns {Promise<Object>} The capabilities of the built-in language model
 */
export default async function getBuiltInLanguageModelCapabilities() {
    const sampleCapabilities = { available: "ready" };
    return sampleCapabilities;
}