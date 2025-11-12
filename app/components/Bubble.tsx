const Bubble = ({ message }) => {
    // Handle different message formats from AI SDK
    // The AI SDK useChat returns messages with either:
    // 1. message.content (string) - for completed messages
    // 2. message.parts array - for structured content
    
    let content = '';
    
    if (typeof message.content === 'string') {
        content = message.content;
    } else if (message.parts && Array.isArray(message.parts)) {
        content = message.parts
            .map((part: any) => part.text || '')
            .join('');
    } else if (message.text) {
        content = message.text;
    }
    
    const { role } = message;

    // Debug log to see what we're receiving
    console.log('Message received:', message);
    console.log('Extracted content:', content);

    return (
        <div className={`bubble message ${role}`}>
            <p>{content}</p>
        </div>
    );
}

export default Bubble;