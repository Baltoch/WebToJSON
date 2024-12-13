export default async function loadExamplePrompt() {
    const url = chrome.runtime.getURL('example.xml');
    const response = await fetch(url);
    return await response.text();
}