import PropTypes from 'prop-types';

export default function BubbleSection({list}) {
    
    const bubbles = list.map(bubble => 
        <article key={bubble.id} className={bubble.user ? 'bubble-user' : 'bubble-ai'}>
            {bubble.content}
        </article>)

    return( 
        <section className="bubble-section">
            {bubbles}
        </section>
    )
}
BubbleSection.propTypes = {
    list: PropTypes.array.isRequired
}