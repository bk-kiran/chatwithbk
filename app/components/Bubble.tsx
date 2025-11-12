const Bubble = ({ message }) => {
    // Handle different message formats from AI SDK
    const content = message.content || 
                   message.parts?.[0]?.text || 
                   message.text || 
                   '';
    
    const { role } = message;

    // Debug log to see what we're receiving
    console.log('Message received:', message);

    return (
        <div className={`bubble message ${role}`}>
            <p>{content}</p>
        </div>
    );
}

export default Bubble;