import PromptSuggestionButton from "./PromptSuggestionButton"

const PromptSuggestionRow = ({ onPromptClick }: { onPromptClick: (text: string) => void }) => {
    const prompts = [
        "Who is BK Kiran?",
        "How can I contact BK Kiran?",
        "Tell me about BK Kiran's projects.",
        "What is BK Kiran's educational background?"
    ]
    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) => <PromptSuggestionButton 
            key={`suggestion-${index}`} 
            text={prompt}
            onClick={() => onPromptClick(prompt)}/>)}
        </div>
    )
}

export default PromptSuggestionRow