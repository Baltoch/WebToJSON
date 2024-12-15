/**
 * ## /!\ This is a test function built to test the sidepanel outside of the extension
 * Use the Chrome Built-in AI summarizer to summarize a text
 * @param {string} text Text to summarize
 * @param {string | null} context Additional context to provide to the summarizer
 * @returns {string} summary
 */
export default async function builtInAISummarize(text, context) {
    return `This is a summary of the text: ${text} with the context: ${context}`;
}