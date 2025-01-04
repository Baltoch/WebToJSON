import PropTypes from 'prop-types';

export default function BubbleSection({list}) {
    
    const bubbles = list.map((bubble, index) => {
        if(bubble.type === "user" || bubble.type === "assistant") {
            return (
                <article key={index} className={`bubble-${bubble.type}`}>
                    {bubble.content}
                </article>
            )
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