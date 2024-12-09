import { ChatOpenAI } from "@langchain/openai";
import { WebAgent, BuiltInAI, sendMessage } from './utils.js';

const prompt = await fs.readFile('./prompt.xml', 'utf8');
const example = await fs.readFile('./example.xml', 'utf8');
let agent;
let model;

if (!('aiOriginTrial' in chrome)) {
    console.error('Error: chrome.aiOriginTrial not supported in this browser');
    model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0
    });
    return;
}
else {
    model = new BuiltInAI();
}

/**
 * Listens for messages from the chrome extension
 */
chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        if (request.type === "UserMessage") {
            if (agent != null) {
                if (request.content.length > 0) {
                    let resp = await agent.call(request.content);
                    sendMessage(resp);
                }
            }
            else {
                sendMessage("Agent not ready", "Error");
            }
        }
        else if (request.type === "WebPageContent") {
            if (request.content.length > 0) {
                agent = new WebAgent(prompt, example, model, request.content);
                sendMessage("Agent ready");
            }
        }
    }
);