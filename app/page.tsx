"use client";

import Image from "next/image";
import logo from "./assets/yo.png";
import { useChat } from "ai/react";  // Changed from @ai-sdk/react to ai/react
import { useState } from "react";
import LoadingBubble from "./components/LoadingBubble";
import Bubble from "./components/Bubble";
import PromptSuggestionRow from "./components/PromptSuggestionRow";

const Home = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  const noMessages = !messages || messages.length === 0;

  const handlePrompt = (promptText: string) => {
    // Create a form event with the prompt text
    const formData = new FormData();
    formData.append('prompt', promptText);
    
    const fakeEvent = {
      preventDefault: () => {},
      target: formData
    } as any;
    
    // Manually set input and submit
    handleInputChange({ target: { value: promptText } } as any);
    setTimeout(() => handleSubmit(fakeEvent), 10);
  };

  return (
    <main>
      <div className="chat-container">
        <Image src={logo} width={250} alt="logo" />
        <section className={noMessages ? "" : "populated"}>
          {noMessages ? (
            <>
              <p className="starter-text">Ask anything about BK Kiran!</p>
              <br />
              <PromptSuggestionRow onPromptClick={handlePrompt} />
            </>
          ) : (
            <div className="messages-container">
              {messages.map((msg, index) => (
                <Bubble key={`message-${index}`} message={msg} />
              ))}
              {isLoading && <LoadingBubble />}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              className="question-box"
              onChange={handleInputChange}
              value={input}
              placeholder="Ask Me Anything..."
              name="prompt"
              disabled={isLoading}
            />
            <input type="submit" value="Submit" disabled={isLoading} />
          </form>
        </section>
      </div>
    </main>
  );
};

export default Home;