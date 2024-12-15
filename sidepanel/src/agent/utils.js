import builtInAICreateSession from "../utils/builtInAICreateSession";
import builtInAISummarize from '../utils/builtInAISummarize.js';
import builtInAITranslate from '../utils/builtInAITranslate.js';
import sendChromeMessage from '../utils/sendChromeMessage.js';

/**
 * Represents a message in the conversation with the AI agent
 */
class Message {
    type = "message";

    constructor(message) {
        this.message = message;
    }

    /**
     * Returns the prompt for the message in the format of a XML tag
     * @returns {string} The prompt for the message
     */
    getPrompt() {
        return `<${this.type}>\n\t${this.message}\n</${this.type}>`;
    }

    /** 
     * Returns the type of the message
     * @returns {string} The type of the message
     */
    getType() {
        return this.type;
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
export class AIMessage extends Message {
    type = "assistant";
}

/**
 * Represents a message from the user to the AI agent
 */
export class HumanMessage extends Message {
    type = "user";
}

/**
 * Represents a message from the system to the AI agent
 */
export class SystemMessage extends Message {
    type = "system";
}

/**
 * Represents the webpage to be analyzed by the AI agent
 */
export class WebpageMessage extends Message {
    type = "webpage";
}

export class BuiltInAI {
    constructor() {
        this.session = null;
    }

    async init() {
        this.session = await builtInAICreateSession({});
    }

    async invoke(text) {
        if (this.session == null) {
            throw new Error("Session not initialized please call init() first");
        }
        const response = await this.session.prompt(text);
        return response;
    }
}

/**
 * AI agent that can interact with the user and the webpage
 * @param {string} system The system prompt for the agent
 * @param {ChatOpenAI | BuiltInAI} model The model to use for the agent
 */
export class WebAgent {
    /**
     * Creates a new WebAgent instance
     * @param {string} system The system prompt for the agent
     * @param {string} example The example prompt session for the agent
     * @param {ChatOpenAI | BuiltInAI} model The model to use for the agent
     * @param {Object} webpage The webpage to analyze
     */
    constructor(system, example, model, webpage) {
        this.json = {};
        this.memory = {};
        this.system = system;
        this.example = example;
        this.session = [new WebpageMessage(webpage)]; // Message history

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

    /**
     * Sets the JSON object
     * @param {Object} json The JSON object to set
     */
    #setJSON(json) {
        this.json = json;
        sendChromeMessage(this.json, "JSON")
    }

    async #execute() {
        // Execute the model with the current message history
        const response = await this.chatModel.invoke(this.#prompt());
        while (response.match("*ACTION*")) {
            this.session.push(new AIMessage(response));
            if (response.match("*addJSONProperty*")) {
                let params = getParams(response)
                this.#setJSON(addJSONProperty(this.json, params["property"], params["value"]));
                this.session.push(new SystemMessage(`JSON object state changed to :\n${JSON.stringify(this.json)}`));
            }
            else if (response.match("*editJSONProperty*")) {
                let params = getParams(response)
                this.#setJSON(editJSONProperty(this.json, params["property"], params["value"]));
                this.session.push(new SystemMessage(`JSON object state changed to :\n${JSON.stringify(this.json)}`));
            }
            else if (response.match("*removeJSONProperty*")) {
                let params = getParams(response)
                this.#setJSON(removeJSONProperty(this.json, params["property"]));
                this.session.push(new SystemMessage(`JSON object state changed to :\n${JSON.stringify(this.json)}`));
            }
            else if (response.match("*addMemoryProperty*")) {
                let params = getParams(response)
                this.memory = addJSONProperty(this.memory, params["property"], params["value"]);
                this.session.push(new SystemMessage(`Memory object state changed to :\n${JSON.stringify(this.memory)}`));
            }
            else if (response.match("*editMemoryProperty*")) {
                let params = getParams(response)
                this.memory = editJSONProperty(this.memory, params["property"], params["value"]);
                this.session.push(new SystemMessage(`Memory object state changed to :\n${JSON.stringify(this.memory)}`));
            }
            else if (response.match("*removeMemoryProperty*")) {
                let params = getParams(response)
                this.memory = removeJSONProperty(this.memory, params["property"]);
                this.session.push(new SystemMessage(`Memory object state changed to :\n${JSON.stringify(this.memory)}`));
            }
            else if (response.match("*summarize*")) {
                let params = getParams(response)
                this.session.push(new SystemMessage(`Summarized text:\n${await builtInAISummarize(params["text"], params["context"])}`));
            }
            else if (response.match("*translate*")) {
                let params = getParams(response)
                this.session.push(new SystemMessage(`Translated text:\n${await builtInAITranslate(params["text"], params["language"])}`));
            }
            else {
                this.session.push(new SystemMessage("Invalid action"));
            }
            let response = await this.chatModel.invoke(this.#prompt());
            this.session.push(new AIMessage(response));
        }
        return response;
    }

    /**
     * Returns the prompt for the current session state
     * @returns {string} The prompt for the current session state
     */
    #prompt() {
        let prompt = ""
        this.session.forEach(message => {
            prompt += message.getPrompt();
            prompt += "\n";
        });
        if (prompt.length < 30000) {
            prompt = `${this.system}\n${this.example}\n${prompt}`;
        }
        else {
            prompt = `${this.system}\n${prompt}`;
        }
        return prompt;
    }
}

/** 
 * Extracts the parameters from an action request from the agent
 * @param {string} response The response to extract parameters from
 * @returns {Object} The extracted parameters
 */
export function getParams(response) {
    const start = response.indexOf("{");
    const end = response.lastIndexOf("}");
    console.log(response.substring(start, end + 1));
    return JSON.parse(response.substring(start, end + 1));
}

/**
 * Allows the Agent to add a property to a JSON object
 * @param {Object} json 
 * @param {string | number} property 
 * @param {*} value
 * @returns {Object} json
 */
export function addJSONProperty(json, property, value) {
    console.log(value);
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
export function editJSONProperty(json, property, value) {
    json[property] = [value];
    return json;
}

/**
 * Allows the Agent to delete a property of a JSON object
 * @param {Object} json 
 * @param {string | number} property
 * @returns {Object} json 
 */
export function removeJSONProperty(json, property) {
    json.drop(property);
    return json;
}