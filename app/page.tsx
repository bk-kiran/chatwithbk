"use client";

import Image from "next/image";
import logo from './assets/yo.png';

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

const Home = () => {
    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
    });

    const [input, setInput] = useState('');
    const noMessages = messages.length === 0;

    return (
        <main>
            <Image src={logo} width="250" alt="logo"/>
            <section>
                {noMessages ? (
                    <>
                        <p className="starter-text">Ask anything about BK Kiran!</p>
                        <br></br>
                        {/* <PromptSuggestionRow/> */}
                    </>
                ) : (
                    <>
                        {/* <LoadingBubble/> */} 
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
        </main>
    )
}

export default Home;