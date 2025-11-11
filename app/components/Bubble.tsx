const Bubble = ({ message }) => {
    const content = message.parts[0]?.text || '';
    const { role } = message;

    return (
        <div className={`bubble ${role}`}>
            <p>{content}</p>
        </div>
    );
}

export default Bubble;