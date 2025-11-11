"use client";

import Image from "next/image";
import logo from './assets/yo.png';
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai';
import { useState } from 'react';
import LoadingBubble from "./components/LoadingBubble";
import Bubble from "./components/Bubble";
import PromptSuggestionRow from "./components/PromptSuggestionRow";

const Home = () => {
    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
    });

    const [input, setInput] = useState('');
    const noMessages = !messages || messages.length === 0;

    const handlePrompt = (promptText: string) => {
        setInput(promptText);
        sendMessage({ text: promptText });
    }

    return (
        <main>
            <div className="chat-container">
                <Image src={logo} width={250} alt="logo"/>
                <section className={noMessages ? "" : "populated"}>
                    {noMessages ? (
                        <>
                            <p className="starter-text">Ask anything about BK Kiran!</p>
                            <br></br>
                            <PromptSuggestionRow onPromptClick = {handlePrompt}/>
                        </>
                    ) : (
                        <>
                            {messages.map((msg, index) => (
                                <Bubble key={index} message={msg} />
                            ))}
                            {status && <LoadingBubble/>}
                        </>
                    )}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (input.trim()) {
                            sendMessage({ text: input });
                            setInput('');
                        }
                    }}>
                        <input 
                            className="question-box" 
                            onChange={(e) => setInput(e.target.value)} 
                            value={input} 
                            placeholder="Ask Me Anything..."
                        />
                        <input type="submit"/>
                    </form>
                </section>
            </div>
        </main>
    )
}

export default Home;