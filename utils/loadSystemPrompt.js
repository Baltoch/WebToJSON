export default async function loadSystemPrompt() {
    const url = chrome.runtime.getURL('prompt.xml');
    const response = await fetch(url);
    return await response.text();
}