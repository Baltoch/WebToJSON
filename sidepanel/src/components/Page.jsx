
import { useState, useRef } from 'react';
import {SendHorizontal} from 'lucide-react';
import BubbleSection from './BubbleSection';
import JSONSection from './JSONSection';
import { json } from '../asset/JSONDataTest';


let nextId = 0;

export default function Page() {

    const [bubbles, setBubbles] = useState([]);
    const [showHomePage, setshowHomePage] = useState(false);
    const labelRef = useRef(null);
    const promptSectionRef = useRef(null);

    const addBubble = (e) => {
        e.preventDefault();
        const data = new FormData(e.target)
        if(e.nativeEvent.submitter.innerText === "AI") {
            setBubbles([
                {id: nextId++, content: data.get("prompt"), user: false},
                ...bubbles
            ])
        }
        else {
            setBubbles([
                {id: nextId++, content: data.get("prompt"), user: true},
                ...bubbles
            ])
        }

        console.log(bubbles);

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
                    <BubbleSection list={bubbles}/>
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
                    {showHomePage && <button type='submit'>AI</button>}
                </form>
            </section>
            <footer>Developped with ♥ by Balthazar and Paul</footer>
        </>
    )
}

