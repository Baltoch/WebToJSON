/**
 * Use the Chrome Built-in AI summarizer to summarize a text
 * @param {string} text Text to summarize
 * @param {string | null} context Additional context to provide to the summarizer
 * @returns {string} summary
 */
export default async function summarize(text, context) {
    // Built-in AI summarizer
    const summarizer = await self.ai.summarizer.create({
        monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
                console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            });
        }
    });
    const summary = await summarizer.summarize(text, {
        context: context,
    });
    return summary;
}