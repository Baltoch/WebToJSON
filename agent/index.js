import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { WebAgent, AIMessage, HumanMessage, SystemMessage, WebpageMessage, BuiltInAI } from './utils.js';

const prompt = await fs.readFile('./prompt.xml', 'utf8');
const example = await fs.readFile('./example.xml', 'utf8');

const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0,
    maxRetries: 2,
    // apiKey: "...",
    // other params...
});

const llm = new BuiltInAI();

const gpt = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
});

/**
 * Listens for messages from the chrome extension
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "WebPageContent") {
            webpage = request.content;
        }
        if (request.type === "UserMessage") {

        }
    }
);