import { BuiltInAI, WebpageMessage, HumanMessage, SystemMessage, AIMessage, addJSONProperty, editJSONProperty, removeJSONProperty, getParams } from './utils.js';
import addChromeMessageListener from "../utils/addChromeMessageListener.js";
import checkBuiltInAISupport from "../utils/checkBuiltInAISupport.js";
import builtInAICreateSession from "../utils/builtInAICreateSession.js";
import checkChromeFileUrl from "../utils/checkChromeFileUrl.js";
import getBuiltInLanguageModelAvailability from "../utils/getBuiltInLanguageModelAvailability.js";
import loadChromeFile from '../utils/loadChromeFile.js';
import builtInAISummarize from '../utils/builtInAISummarize.js';
import builtInAITranslate from '../utils/builtInAITranslate.js';

class LoadProgress {
    constructor() {
        this.progress = 0;
    }

    monitor(model) {
        model.addEventListener('downloadprogress', (e) => {
            this.progress = e.loaded / e.total;
        });
    }
}

export default class BuiltInAIAgent {
    constructor(jsonState, setJSONState, sessionState, setSessionState) {
        this.jsonState = jsonState;
        this.setJSONState = setJSONState;
        this.sessionState = sessionState;
        this.setSessionState = setSessionState;
        this.status = "Not Initiated";
        this.ready = false;
        this.webpage = null;
        this.loadProgress = new LoadProgress();
        addChromeMessageListener(
            async function (request) {
                if (request.type === "WebPageContent") {
                    if (request.content.length > 0) {
                        this.webpage = request.content;
                    }
                }
            }.bind(this)
        );
    }

    async init() {
        // Checking if the browser supports the AI Origin Trial API
        if (!checkBuiltInAISupport()) {
            this.status = "Unsupported browser";
            return this.status;
        }
        // Checking if the model is available
        let available = await getBuiltInLanguageModelAvailability();
        if (available === 'no') {
            this.status = "No model available";
            return this.status;
        }
        else if (available === 'after-download') {
            this.status = "Downloading model...";
            builtInAICreateSession({
                monitor: this.loadProgress.monitor.bind(this.loadProgress),
            });
            while (this.loadProgress.progress < 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            this.status = "Downloaded Model";
        }

        // Checking if the webpage is loaded
        if (this.webpage == null) {
            this.status = "Awaiting webpage...";
            while (this.webpage == null) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            this.status = "Webpage loaded";
        }

        // Checking if the prompt file is available
        if (!checkChromeFileUrl('./prompt.xml')) {
            this.status = "Prompt file not found";
            return this.status;
        }

        // Checking if the example file is available
        if (!checkChromeFileUrl('./example.xml')) {
            this.status = "Example file not found";
            return this.status;
        }

        // Loading the prompt and example files
        this.system = await loadChromeFile('./prompt.xml');
        this.example = await loadChromeFile('./example.xml');

        console.log(this.#prompt());

        this.chatModel = new BuiltInAI();
        await this.chatModel.init();
        this.status = "Model ready";
        this.setSession([new WebpageMessage(this.webpage)])
        this.ready = true;
        this.status = "Agent ready";
        return this.status;
    }

    setSession(newState) {
        this.setSessionState([...newState]);
        this.sessionState = [...newState];
    }

    pushSession(newMessage) {
        this.setSessionState([...this.sessionState, newMessage]);
        this.sessionState = [...this.sessionState, newMessage];
    }

    async call(message) {
        if (!this.ready) {
            throw new Error(`Agent not ready, current status: ${this.status}`);
        }
        // Add user message to history
        this.pushSession(new HumanMessage(message));

        // Execute the model and get the result
        const result = await this.#execute();

        // Add assistant's response to history
        this.pushSession(new AIMessage(result));

        return result;
    }

    async #execute() {
        // Execute the model with the current message history
        let response = await this.chatModel.invoke(this.#prompt());
        while (response.match(".*ACTION.*")) {
            this.pushSession(new AIMessage(response));
            if (response.match(".*addJSONProperty.*")) {
                let params = getParams(response)
                this.setJSONState(addJSONProperty(this.jsonState, params["property"], params["value"]));
                this.pushSession(new SystemMessage(`JSON object state changed to :\n${JSON.stringify(this.jsonState)}`));
            }
            else if (response.match(".*editJSONProperty.*")) {
                let params = getParams(response)
                this.setJSONState(editJSONProperty(this.jsonState, params["property"], params["value"]));
                this.pushSession(new SystemMessage(`JSON object state changed to :\n${JSON.stringify(this.jsonState)}`));
            }
            else if (response.match(".*removeJSONProperty.*")) {
                let params = getParams(response)
                this.setJSONState(removeJSONProperty(this.jsonState, params["property"]));
                this.pushSession(new SystemMessage(`JSON object state changed to :\n${JSON.stringify(this.jsonState)}`));
            }
            else if (response.match(".*addMemoryProperty.*")) {
                let params = getParams(response)
                this.memory = addJSONProperty(this.memory, params["property"], params["value"]);
                this.pushSession(new SystemMessage(`Memory object state changed to :\n${JSON.stringify(this.memory)}`));
            }
            else if (response.match(".*editMemoryProperty.*")) {
                let params = getParams(response)
                this.memory = editJSONProperty(this.memory, params["property"], params["value"]);
                this.pushSession(new SystemMessage(`Memory object state changed to :\n${JSON.stringify(this.memory)}`));
            }
            else if (response.match(".*removeMemoryProperty.*")) {
                let params = getParams(response)
                this.memory = removeJSONProperty(this.memory, params["property"]);
                this.pushSession(new SystemMessage(`Memory object state changed to :\n${JSON.stringify(this.memory)}`));
            }
            else if (response.match(".*summarize.*")) {
                let params = getParams(response)
                this.pushSession(new SystemMessage(`Summarized text:\n${await builtInAISummarize(params["text"], params["context"])}`));
            }
            else if (response.match(".*translate.*")) {
                let params = getParams(response)
                this.pushSession(new SystemMessage(`Translated text:\n${await builtInAITranslate(params["text"], params["language"])}`));
            }
            else {
                this.pushSession(new SystemMessage("Invalid action"));
            }
            response = await this.chatModel.invoke(this.#prompt());
            this.pushSession(new AIMessage(response));
        }
        console.log(response);
        return response;
    }

    /**
     * Returns the prompt for the current session state
     * @returns {string} The prompt for the current session state
     */
    #prompt() {
        let prompt = ""
        this.sessionState.forEach(message => {
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