"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

export default function ChatSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [messages, setMessages] = useState<
    { id: string; text: string; from: "user" | "bot" | "system" }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load chat history for this session
  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const loadHistory = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/sessions/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const loadedMessages = [];

        for (const chat of res.data.chats) {
          loadedMessages.push({
            id: chat.id + "-u",
            text: chat.prompt,
            from: "user" as const,
          });
          loadedMessages.push({
            id: chat.id + "-b",
            text: chat.response,
            from: "bot" as const,
          });
        }

        // Add system message at top ONCE
        if (loadedMessages.length === 0) {
          loadedMessages.unshift({
            id: "system-welcome",
            text: "Welcome to OA Trax!",
            from: "system" as const,
          });
        }

        setMessages(loadedMessages);
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };

    loadHistory();
  }, [sessionId, token, router]);

  // Ask AI
  const getBotResponse = async (userInput: string) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/askAI?sessionId=${sessionId}`,
        { prompt: userInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.data.aiResponse;
    } catch (error) {
      console.error("Error fetching bot response:", error);
      return "Sorry, something went wrong.";
    }
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      text: input,
      from: "user" as const,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const aiReply = await getBotResponse(input);

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: aiReply,
        from: "bot" as const,
      },
    ]);

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.from === "user"
                ? "justify-end"
                : msg.from === "system"
                ? "justify-center"
                : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded max-w-xs break-words ${
                msg.from === "user"
                  ? "bg-blue-500 text-white"
                  : msg.from === "system"
                  ? "bg-gray-300 text-black"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="p-2 rounded max-w-xs bg-gray-200 text-black">
              Bot is typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Input bar */}
      <div className="p-4 border-t bg-white flex">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 border rounded px-3 py-2 mr-2 focus:outline-none focus:ring"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}

