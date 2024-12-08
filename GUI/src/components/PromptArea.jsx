export default function PromptArea() {

    const textarea = {
        width : "50%",
        minHeight: "40px",
        borderColor: "solid 1px #747070",
        borderRadius: "16px",
        backgroundColor: "#E5EEF4"
    }

    return <textarea name="prompt" placeholder="Type your prompt here" style={textarea}/>;

}