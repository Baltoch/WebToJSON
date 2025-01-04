import { WebAgent, BuiltInAI } from "./agent/utils.js";
import addChromeMessageListener from "./utils/addChromeMessageListener.js";
import sendChromeMessage from "./utils/sendChromeMessage.js";
import checkBuiltInAISupport from "./utils/checkBuiltInAISupport.js";
import getBuiltInLanguageModelAvailability from "./utils/getBuiltInLanguageModelAvailability.js";
import builtInAICreateSession from "./utils/builtInAICreateSession.js";
import checkChromeFileUrl from "./utils/checkChromeFileUrl.js";
import loadChromeFile from "./utils/loadChromeFile.js";

/**
 * Initializes the agent
 * @returns {WebAgent | null} The initialized agent or null if the model is not available
*/
async function init() {
    // Checking if the browser supports the AI Origin Trial API
    if (!checkBuiltInAISupport()) {
        sendChromeMessage("Unsupported browser", "assistant_status");
    }

    // Checking if the model is available
    let available = await getBuiltInLanguageModelAvailability();
    if (available === 'no') {
        sendChromeMessage("No model available", "assistant_status");
        console.error("No model available");
        return;
    }
    else if (available === 'after-download') {
        sendChromeMessage("Downloading model...", "assistant_status");
        builtInAICreateSession({
            monitor: (model) => {
                model.addEventListener('downloadprogress', (e) => {
                    sendChromeMessage(`Downloading model ${e.loaded / e.total * 100}%`, "assistant_status");
                });
            },
        });
        while (await getBuiltInLanguageModelAvailability() !== 'readily') {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        sendChromeMessage("Downloaded model", "assistant_status");
    }

    // Checking if the webpage is loaded
    if (webpage == null) {
        sendChromeMessage("Awaiting webpage...", "assistant_status");
        while (webpage == null) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        sendChromeMessage("Webpage loaded", "assistant_status");
    }

    // Checking if the prompt file is available
    if (!checkChromeFileUrl('./prompt.xml')) {
        sendChromeMessage("Prompt file not found. Try reinstalling the extension", "assistant_status");
    }

    // Checking if the example file is available
    if (!checkChromeFileUrl('./example.xml')) {
        sendChromeMessage("Example session file not found. Try reinstalling the extension", "assistant_status");
    }

    // Loading the prompt and example files
    const system = await loadChromeFile('./prompt.xml');
    const example = await loadChromeFile('./example.xml');

    const chatModel = new BuiltInAI();
    await chatModel.init();
    sendChromeMessage("Model ready", "assistant_status");
    agent = new WebAgent(system, example, chatModel, webpage);
    sendChromeMessage("Agent ready", "assistant_status");
    return agent;
}


addChromeMessageListener(async function messageListener(request, sender, sendResponse) {
    console.log(request);
    if (request.type === "webpage_content") {
        if (request.content.length > 0) {
            webpage = request.content;
        }
    }
    else if (request.type === "user_prompt") {
        if (request.content.length > 0) {
            while (agent === null) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            agent.call(request.content);
        }
    }
});

let webpage = null;

let agent = null;

async function setAgent() {
    agent = await init();
}
async function checkAgent() {
    while (agent == null) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log("Agent ready");
}

chrome.runtime.onInstalled.addListener(() => {
    console.log('Web Scraper extension installed');
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

    console.log("Initializing agent");
    setAgent().then(() => {
        console.log("Agent set");
        checkAgent();
    });
});