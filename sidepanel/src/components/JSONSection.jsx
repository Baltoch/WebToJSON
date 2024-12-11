import PropTypes from 'prop-types';

export default function JSONSection({object}){
    return (
        <section className="json-area">
            <pre>{JSON.stringify(object, null, 2)}</pre>
        </section>
    )
}
JSONSection.propTypes = {
    object: PropTypes.object.isRequired
}