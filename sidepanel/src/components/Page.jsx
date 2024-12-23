import { useState, useRef, useEffect } from 'react';
import {SendHorizontal} from 'lucide-react';
import BubbleSection from './BubbleSection';
import JSONSection from './JSONSection';
// import { json } from '../asset/JSONDataTest';
import BuiltInAIAgent from '../agent/index.js';

export default function Page() {
    const labelRef = useRef(null);
    const promptSectionRef = useRef(null);
    const [showHomePage, setshowHomePage] = useState(false);
    const [json, setJSON] = useState({});
    const [session, setSession] = useState([]); 
    const agent = useRef(new BuiltInAIAgent(json, setJSON, session, setSession));

    useEffect(() => {
        async function initAgent() {
            console.log("Initializing agent");
            agent.current.init();
            while (agent.current.status != "Agent ready") {
                console.log(agent.current.status)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            console.log("Agent initialized");
        }
        initAgent();
    }, []);

    async function addBubble(e) { 
        e.preventDefault();
        const data = new FormData(e.target)
        await agent.current.call(data.get("prompt"));
        labelRef.current.remove();
        promptSectionRef.current.className = 'prompt-section-down';
        setshowHomePage(true);
        e.target.reset()
    }

    return (
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
            <footer>Developped with ♥ by Balthazar and Paul</footer>
        </>
    )
}

