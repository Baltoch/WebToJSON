import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

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
 * Represents a message in the conversation with the AI agent
 */
class Message {
    #type = "message";

    constructor(message) {
        this.message = message;
    }

    /**
     * Returns the prompt for the message in the format of a XML tag
     * @returns {string} The prompt for the message
     */
    getPrompt() {
        return `<${this.#type}>\n\t${this.message}\n</${this.#type}>`;
    }

    /**
     * Returns the content of the message
     * @returns {string} The content of the message
     */
    toString() {
        return this.message;
    }
}

/**
 * Represents a message from the AI agent to the user
 */
class AIMessage extends Message {
    #type = "assistant";
}

/**
 * Represents a message from the user to the AI agent
 */
class HumanMessage extends Message {
    #type = "user";
}

/**
 * Represents a message from the system to the AI agent
 */
class SystemMessage extends Message {
    #type = "system";
}

/**
 * Represents the webpage to be analyzed by the AI agent
 */
class WebpageMessage extends Message {
    #type = "webpage";
}

class BuiltInAI extends ChatOpenAI {
    constructor() {
        this.session = chrome.aiOriginTrial.languageModel.create({
            systemPrompt: prompt
        });
    }

    async invoke(text) {
        const response = await this.session.prompt(text);
        return response;
    }
}

/**
 * AI agent that can interact with the user and the webpage
 * @param {string} system The system prompt for the agent
 * @param {ChatOpenAI | BuiltInAI} model The model to use for the agent
 */
class WebAgent {
    /**
     * Creates a new WebAgent instance
     * @param {string} system The system prompt for the agent
     * @param {ChatOpenAI | BuiltInAI} model The model to use for the agent
     */
    constructor(system, model) {
        this.json = {};
        this.memory = {};
        this.system = system;
        this.session = []; // Message history

        // Initialize the chat model
        this.chatModel = model;
    }

    async call(message) {
        // Add user message to history
        this.session.push(new HumanMessage(message));

        // Execute the model and get the result
        const result = await this.#execute();

        // Add assistant's response to history
        this.session.push(new AIMessage(result));

        return result;
    }

    async #execute() {
        // Execute the model with the current message history
        const response = await this.chatModel.invoke(this.#prompt());
        while (response.match("*ACTION*")) {
            this.session.push(new AIMessage(response));
            if (response.match("*addJSONProperty*")) {
                params = getParams(response)
                this.json = addJSONProperty(this.json, params["property"], params["value"]);
                this.session.push(new SystemMessage(`JSON object state changed to :\n${JSON.stringify(this.json)}`));
            }
            else if (response.match("*editJSONProperty*")) {
                params = getParams(response)
                this.json = editJSONProperty(this.json, params["property"], params["value"]);
                this.session.push(new SystemMessage(`JSON object state changed to :\n${JSON.stringify(this.json)}`));
            }
            else if (response.match("*removeJSONProperty*")) {
                params = getParams(response)
                this.json = removeJSONProperty(this.json, params["property"]);
                this.session.push(new SystemMessage(`JSON object state changed to :\n${JSON.stringify(this.json)}`));
            }
            else if (response.match("*addMemoryProperty*")) {
                params = getParams(response)
                this.memory = addJSONProperty(this.memory, params["property"], params["value"]);
                this.session.push(new SystemMessage(`Memory object state changed to :\n${JSON.stringify(this.memory)}`));
            }
            else if (response.match("*editMemoryProperty*")) {
                params = getParams(response)
                this.memory = editJSONProperty(this.memory, params["property"], params["value"]);
                this.session.push(new SystemMessage(`Memory object state changed to :\n${JSON.stringify(this.memory)}`));
            }
            else if (response.match("*removeMemoryProperty*")) {
                params = getParams(response)
                this.memory = removeJSONProperty(this.memory, params["property"]);
                this.session.push(new SystemMessage(`Memory object state changed to :\n${JSON.stringify(this.memory)}`));
            }
            else if (response.match("*summarize*")) {
                params = getParams(response)
                this.session.push(new SystemMessage(await summarize(params["text"], params["context"])));
            }
            else if (response.match("*translate*")) {
                params = getParams(response)
                this.session.push(new SystemMessage(await translate(params["text"], params["language"])));
            }
            else {
                this.session.push(new SystemMessage("Invalid action"));
            }
            response = await this.chatModel.invoke(this.#prompt());
        }
        return response;
    }

    /**
     * Returns the prompt for the current session state
     * @returns {string} The prompt for the current session state
     */
    #prompt() {
        let prompt = this.system;
        prompt += "\n";
        this.session.forEach(message => {
            prompt += message.getPrompt();
            prompt += "\n";
        });
        return prompt;
    }
}

/** 
 * Extracts the parameters from an action request from the agent
 * @param {string} response The response to extract parameters from
 * @returns {Object} The extracted parameters
 */
function getParams(response) {
    start = response.indexOf("{");
    end = response.lastIndexOf("}");
    return JSON.parse(response.substring(start, end + 1));
}

/**
 * Allows the Agent to add a property to a JSON object
 * @param {Object} json 
 * @param {string | number} property 
 * @param {*} value
 * @returns {Object} json
 */
function addJSONProperty(json, property, value) {
    if (json[property]) {
        json[property].push(value);
    } else {
        json[property] = [value];
    }
    return json;
}

/**
 * Allows the Agent to edit a property to a JSON object
 * @param {Object} json 
 * @param {string | number} property 
 * @param {*} value
 * @returns {Object} json
 */
function editJSONProperty(json, property, value) {
    json[property] = [value];
    return json;
}

/**
 * Allows the Agent to delete a property of a JSON object
 * @param {Object} json 
 * @param {string | number} property
 * @returns {Object} json 
 */
function removeJSONProperty(json, property) {
    json.drop(property);
    return json;
}

/**
 * Use the Chrome Built-in AI summarizer to summarize a text
 * @param {string} text Text to summarize
 * @param {string | null} context Additional context to provide to the summarizer
 * @returns {string} summary
 */
async function summarize(text, context) {
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

/**
 * Use Chrome Built-in AI translator to translate a text
 * @param {string} text text to translate
 * @param {string} language language to translate to
 * @returns {string} translation
 */
async function translate(text, language) {
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