/* eslint-disable react/prop-types */

export default function JSONSection({object}){

    return (
        <section className="json-area">
            <pre>{JSON.stringify(object, null, 2)}</pre>
        </section>
    )
}