/**
 * Use Chrome Built-in AI translator to translate a text
 * @param {string} text text to translate
 * @param {string} language language to translate to
 * @returns {string} translation
 */
export default async function builtInAITranslate(text, language) {
    // Detecting the source language
    detector = await self.translation.createDetector();
    const sourceLanguage = await detector.detect(someUserText);

    // Translating the text
    const translator = await self.translation.createTranslator({
        sourceLanguage: sourceLanguage,
        targetLanguage: language,
    });
    const translation = await translator.translate(text);
    return translation;
}