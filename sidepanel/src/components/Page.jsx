import { useState, useRef, useEffect } from 'react';
import {SendHorizontal} from 'lucide-react';
import BubbleSection from './BubbleSection';
import JSONSection from './JSONSection';
// import { json } from '../asset/JSONDataTest';
// import BuiltInAIAgent from '../agent/index.js';
import addChromeMessageListener from '../utils/addChromeMessageListener.js';
import sendChromeMessage from '../utils/sendChromeMessage.js';

export default function Page() {
    const labelRef = useRef(null);
    const promptSectionRef = useRef(null);
    const [showHomePage, setshowHomePage] = useState(false);
    const [agentReady, setAgentReady] = useState(false);
    const [agentStatus, setAgentStatus] = useState("");
    const [json, setJSON] = useState({});
    const [session, setSession] = useState([]); 
    // const agent = useRef(new BuiltInAIAgent(json, setJSON, session, setSession));

    useEffect(() => {
        // async function initAgent() {
        //     console.log("Initializing agent");
        //     agent.current.init();
        //     while (agent.current.status != "Agent ready") {
        //         console.log(agent.current.status)
        //         await new Promise(resolve => setTimeout(resolve, 1000));
        //     }
        //     console.log("Agent initialized");
        // }
        // initAgent();
        // eslint-disable-next-line no-unused-vars
        addChromeMessageListener((request, sender, sendResponse) => {
            if (request.type === "assistant_status") {
                setAgentStatus(request.content);
                if (request.content === "Agent ready") {
                    setAgentReady(true);
                }
            }
            else if (request.type === "assistant") {
                setSession([
                    ...session,
                    {content: request.content, type: request.type}
                ]);
            }
            else if (request.type === "json") {
                setJSON(request.content);
            }
        });
    }, []);

    async function addBubble(e) { 
        e.preventDefault();
        const data = new FormData(e.target)
        const userPrompt = data.get("prompt");
        setSession([
            ...session,
            {type: "user", content: userPrompt}
        ])
        sendChromeMessage(userPrompt, "user");
        // await agent.current.call(data.get("prompt"));
        labelRef.current.remove();
        promptSectionRef.current.className = 'prompt-section-down';
        setshowHomePage(true);
        e.target.reset()
    }

    if (agentReady) return (
        <>
            {showHomePage && (
                <>
                    <JSONSection object={json}/>
                    <BubbleSection list={session}/>
                </>)
            }
            <section className='prompt-section' ref={promptSectionRef}>
                <h2 ref={labelRef}>Your Json file generator is ready</h2>
                <form className='prompt-area' onSubmit={(e) => addBubble(e)}>
                    <textarea
                        name='prompt'
                        placeholder='Type your prompt here'
                    />
                    <button type='submit' className='submit-button'>
                        <SendHorizontal strokeWidth={2} />
                    </button>
                </form>
            </section>
            <footer>Developped with ♥ by <a href='https://github.com/Baltoch' target='_blank'>Balthazar</a> and <a href='https://github.com/PaulGOMA' target='_blank'>Paul</a></footer>
        </>
    );
    else return (
        <>
            <h1>{agentStatus}</h1>
        </>
    );
}

