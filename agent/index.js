import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/schema";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0,
    maxRetries: 2,
    // apiKey: "...",
    // other params...
});

class BuiltInAI {
    constructor() {
        this.session = chrome.aiOriginTrial.languageModel.create({
            systemPrompt: `You are a helpful assistant that translates web pages into JSON objects.
            The properties of the JSON object depend on what the user wants.
            You run in a loop of Thought, Action, PAUSE, Observation.
            At the end of the loop you output an Answer
            Use Thought to describe your thoughts about the question you have been asked.
            Use Action to run one of the actions available to you - then return PAUSE.
            Observation will be the result of running those actions.
        
            Your available actions are:
        
            calculate:
            e.g. calculate: 4 * 7 / 3
            Runs a calculation and returns the number - uses Python so be sure to use floating point syntax if necessary
        
            average_dog_weight:
            e.g. average_dog_weight: Collie
            returns average weight of a dog when given the breed
        
            Example session:
        
            Question: How much does a Bulldog weigh?
            Thought: I should look the dogs weight using average_dog_weight
            Action: average_dog_weight: Bulldog
            PAUSE
        
            You will be called again with this:
        
            Observation: A Bulldog weights 51 lbs
        
            You then output:
        
            Answer: A bulldog weights 51 lbs`
        });
    }

    async invoke(text) {
        const response = await this.session.prompt(text);
        return response;
    }
}

const llm = new BuiltInAI();

const gpt = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
});

class WebAgent {
    constructor() {
        this.system = `You are a helpful assistant that translates web pages into JSON objects.
    The properties of the JSON object depend on what the user wants.
    You run in a loop of Thought, Action, PAUSE, Observation.
    At the end of the loop you output an Answer
    Use Thought to describe your thoughts about the question you have been asked.
    Use Action to run one of the actions available to you - then return PAUSE.
    Observation will be the result of running those actions.

    Your available actions are:

    calculate:
    e.g. calculate: 4 * 7 / 3
    Runs a calculation and returns the number - uses Python so be sure to use floating point syntax if necessary

    average_dog_weight:
    e.g. average_dog_weight: Collie
    returns average weight of a dog when given the breed

    Example session:

    Question: How much does a Bulldog weigh?
    Thought: I should look the dogs weight using average_dog_weight
    Action: average_dog_weight: Bulldog
    PAUSE

    You will be called again with this:

    Observation: A Bulldog weights 51 lbs

    You then output:

    Answer: A bulldog weights 51 lbs`;
        this.messages = []; // Message history

        if (this.system) {
            this.messages.push(new SystemMessage(this.system));
        }

        // Initialize the chat model
        this.chatModel = gpt;
    }

    async call(message) {
        // Add user message to history
        this.messages.push(new HumanMessage(message));

        // Execute the model and get the result
        const result = await this.execute();

        // Add assistant's response to history
        this.messages.push(new AIMessage(result));

        return result;
    }

    async execute() {
        // Execute the model with the current message history
        const response = await this.chatModel.invoke(this.messages);

        return response.content;
    }
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