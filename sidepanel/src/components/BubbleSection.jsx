import PropTypes from 'prop-types';

export default function BubbleSection({list}) {
    
    const bubbles = list.map((bubble, index) => {
        if(bubble.getType() === "user" || bubble.getType() === "assistant") {
            return (<article key={index} className={`bubble-${bubble.getType()}`}>
                {bubble.toString()}
            </article>)
        }
    })

    return( 
        <section className="bubble-section">
            {bubbles}
        </section>
    )
}
BubbleSection.propTypes = {
    list: PropTypes.array.isRequired
}