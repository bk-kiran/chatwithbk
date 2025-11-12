"use client";

import Image from "next/image";
import logo from "./assets/yo.png";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import LoadingBubble from "./components/LoadingBubble";
import Bubble from "./components/Bubble";
import PromptSuggestionRow from "./components/PromptSuggestionRow";

const Home = () => {
  // ✅ No options — uses default /api/chat
  const { messages, sendMessage, status } = useChat();

  const [input, setInput] = useState("");
  const noMessages = !messages || messages.length === 0;
  const isLoading = status === "submitted" || status === "streaming";

  const handlePrompt = (promptText: string) => {
    setInput(promptText);
    sendMessage({ text: promptText });
    setInput("");
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage({ text: input });
                setInput("");
              }
            }}
          >
            <input
              className="question-box"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Ask Me Anything..."
              name="prompt"
              disabled={status !== "ready"}
            />
            <input type="submit" value="Submit" disabled={status !== "ready"} />
          </form>
        </section>
      </div>
    </main>
  );
};

export default Home;
