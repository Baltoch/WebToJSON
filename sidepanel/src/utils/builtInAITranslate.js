/**
 * ## /!\ This is a test function built to test the sidepanel outside of the extension
 * Use Chrome Built-in AI translator to translate a text
 * @param {string} text text to translate
 * @param {string} language language to translate to
 * @returns {string} translation
 */
export default async function builtInAITranslate(text, language) {
    return `This is a translation of the text: ${text} to the language: ${language}`;
}