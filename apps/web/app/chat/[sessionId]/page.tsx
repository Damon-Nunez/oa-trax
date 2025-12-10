"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";



const themeClasses: Record<string, string> = {
  Tutor: "bg-gradient-to-b from-[#0d1b2a] to-[#1b263b]",      // deep blue
  Interview: "bg-gradient-to-b from-black to-green-900",      // black → dark green
  Assistant: "bg-gradient-to-b from-gray-900 to-gray-700",    // neutral gray
};

export default function ChatSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [messages, setMessages] = useState<
    {
      id: string;
      text: string;
      from: "user" | "bot" | "system";
      mode?: string | null;
      step?: string | null;
      correct?: boolean | null;
      metadata?: any | null;
    }[]
  >([]);

  // TIMER STATE
  const [showTimerTray, setShowTimerTray] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const [customSeconds, setCustomSeconds] = useState("");
  const [userMode, setUserMode] = useState<"Tutor" | "Interview" | "Assistant">(
    "Tutor"
  );

  // Format seconds → MM:SS
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Start timer
  const startTimer = () => {
    if (timeLeft > 0) setTimerRunning(true);
  };

  // Pause timer
  const pauseTimer = () => {
    setTimerRunning(false);
  };

  // Reset timer
  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(0);
    setCustomMinutes("");
    setCustomSeconds("");
  };

  // Countdown effect
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

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

        const loadedMessages: {
          id: string;
          text: string;
          from: "user" | "bot" | "system";
          mode?: string | null;
          step?: string | null;
          correct?: boolean | null;
          metadata?: any | null;
        }[] = [];

        for (const chat of res.data.chats) {
          // USER MESSAGE
          loadedMessages.push({
            id: chat.id + "-u",
            text: chat.prompt,
            from: "user",
            mode: null,
            step: null,
            correct: null,
            metadata: null,
          });

          // BOT MESSAGE (JSON PARSED)
          let parsedResponse: any = null;

          try {
            parsedResponse = JSON.parse(chat.response);
          } catch (err) {
            console.error("Failed to parse AI JSON:", chat.response);
            // Fallback to plain text if AI ever slipped
            parsedResponse = {
              reply: chat.response,
              mode: "Assistant",
              step: null,
              correct: null,
              metadata: null,
            };
          }

          loadedMessages.push({
            id: chat.id + "-b",
            text: parsedResponse.reply,
            from: "bot",
            mode: parsedResponse.mode,
            step: parsedResponse.step,
            correct: parsedResponse.correct,
            metadata: parsedResponse.metadata,
          });
        }

        // If session empty, add system message
        if (loadedMessages.length === 0) {
          loadedMessages.unshift({
            id: "system-welcome",
            text: "Welcome to OA Trax!",
            from: "system",
            mode: null,
            step: null,
            correct: null,
            metadata: null,
          });
        }

        setMessages(loadedMessages);
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };

    loadHistory();
  }, [sessionId, token, router]);

  // Fetch user mode from backend
  useEffect(() => {
    const fetchMode = async () => {
      if (!token) return;

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const modeFromServer = res.data.mode as
          | "Tutor"
          | "Interview"
          | "Assistant"
          | undefined;
        if (
          modeFromServer &&
          ["Tutor", "Interview", "Assistant"].includes(modeFromServer)
        ) {
          setUserMode(modeFromServer);
        }
      } catch (err) {
        console.error("Failed to fetch user mode:", err);
      }
    };

    fetchMode();
  }, [token]);

  useEffect(() => {
  if (!textRef.current) return;
  const el = textRef.current;

  el.style.height = "auto";                      // reset height
  el.style.height = el.scrollHeight + "px";      // grow to fit content
}, [input]);


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

      console.log("🔍 FULL AI RESPONSE (Frontend):", res.data.aiResponse);
      return res.data.aiResponse; // already parsed JSON from backend
    } catch (error) {
      console.error("Error fetching bot response:", error);
      return {
        reply: "Sorry, something went wrong.",
        mode: "Assistant",
        step: null,
        correct: null,
        metadata: null,
      };
    }
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      text: input,
      from: "user" as const,
      mode: null,
      step: null,
      correct: null,
      metadata: null,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const aiReply = await getBotResponse(input);

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: aiReply.reply,
        from: "bot" as const,
        mode: aiReply.mode,
        step: aiReply.step,
        correct: aiReply.correct,
        metadata: aiReply.metadata,
      },
    ]);

    setLoading(false);
  };

  // Enter / Shift+Enter logic for textarea
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    // SHIFT + ENTER → allow newline
    if (e.key === "Enter" && e.shiftKey) {
      return;
    }

    // ENTER without SHIFT → send
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // Insert ``` code block like Slack
  const handleInsertCodeBlock = () => {
    const block = "```\n\n```";

    setInput((prev) => {
      const textarea = textRef.current;

      // If ref missing, just append at end
      if (!textarea) {
        return (prev ? prev + "\n" : "") + block;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue =
        prev.substring(0, start) + block + prev.substring(end);

      // Move cursor *inside* the code block
      setTimeout(() => {
        const cursorPos = start + 4; // ```\n|
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = cursorPos;
      }, 0);

      return newValue;
    });
  };

  // Determine theme for current mode
  const currentThemeClass =
    themeClasses[userMode] ?? themeClasses["Tutor"];

  return (
    <div
      className={`
        flex flex-col h-screen 
        text-gray-100 
        transition-all duration-700 ease-in-out 
        mode-animate
        ${currentThemeClass}
      `}
    >
      {/* MODE SELECTOR (top bar) */}
      <div className="p-3 bg-black/50 border-b border-gray-800 flex justify-end backdrop-blur-sm">
        <select
          value={userMode}
          onChange={async (e) => {
            const newMode = e.target.value as
              | "Tutor"
              | "Interview"
              | "Assistant";
            setUserMode(newMode);

            try {
              await axios.patch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/mode`,
                { mode: newMode },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch (err) {
              console.error("Error updating mode:", err);
            }
          }}
          className="
            border border-gray-700 
            bg-[#1e1e1e] 
            text-gray-200 
            rounded px-2 py-1 
            focus:outline-none 
            focus:ring-1 
            focus:ring-blue-500 
            cursor-pointer
          "
        >
          <option value="Tutor">Tutor</option>
          <option value="Interview">Interview</option>
          <option value="Assistant">Assistant</option>
        </select>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-3 bg-black/20">
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
              className={`
                px-4 py-3 
                rounded-2xl 
                max-w-md 
                break-words 
                shadow-lg 
                transition-all 
                duration-200
                ${
                  msg.from === "user"
                    ? "bg-[#3b3b3b] text-white self-end shadow-[0_0_10px_rgba(0,0,0,0.4)]"
                    : msg.from === "system"
                    ? "bg-[#555] text-white mx-auto shadow-[0_0_10px_rgba(0,0,0,0.35)]"
                    : "bg-[#2e2e2e] text-gray-200 shadow-[0_0_10px_rgba(0,0,0,0.35)]"
                }
              `}
            >
          <ReactMarkdown
  remarkPlugins={[remarkGfm]}
>
  {msg.text}
</ReactMarkdown>



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

      {/* TIMER + INPUT BAR AREA */}
      <div className="relative">
        {/* Timer Tray (only visible when expanded) */}
        {showTimerTray && (
          <div
            className="
              absolute 
              bottom-full left-4 right-4 
              bg-[#111] 
              border border-gray-800 
              shadow-xl 
              p-4 
              rounded-xl 
              space-y-3
            "
          >
            <h3 className="font-semibold mb-2">Timer</h3>

            {/* Preset buttons */}
            <div className="flex mb-3">
              <button
                className="
                  px-4 py-1.5 
                  bg-[#1f1f1f] 
                  text-gray-200 
                  rounded-l-lg 
                  border border-gray-700 
                  hover:bg-[#2b2b2b] 
                  transition
                "
                onClick={() => setTimeLeft(5 * 60)}
              >
                5 min
              </button>

              <button
                className="
                  px-4 py-1.5 
                  bg-[#1f1f1f] 
                  text-gray-200 
                  border-t border-b border-gray-700 
                  hover:bg-[#2b2b2b] 
                  transition
                "
                onClick={() => setTimeLeft(10 * 60)}
              >
                10 min
              </button>

              <button
                className="
                  px-4 py-1.5 
                  bg-[#1f1f1f] 
                  text-gray-200 
                  rounded-r-lg 
                  border border-gray-700 
                  hover:bg-[#2b2b2b] 
                  transition
                "
                onClick={() => setTimeLeft(20 * 60)}
              >
                20 min
              </button>
            </div>

            {/* Custom time entry */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                placeholder="min"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="
                  w-16 
                  bg-[#0f0f0f] 
                  text-gray-200 
                  border border-gray-700 
                  rounded-lg 
                  px-2 py-1 
                  appearance-none 
                  placeholder-gray-500 
                  focus:outline-none 
                  focus:ring-1 
                  focus:ring-blue-500
                "
              />

              <input
                type="number"
                placeholder="sec"
                value={customSeconds}
                onChange={(e) => setCustomSeconds(e.target.value)}
                className="
                  w-16 
                  bg-[#0f0f0f] 
                  text-gray-200 
                  border border-gray-700 
                  rounded-lg 
                  px-2 py-1 
                  appearance-none 
                  placeholder-gray-500 
                  focus:outline-none 
                  focus:ring-1 
                  focus:ring-blue-500
                "
              />

              <button
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => {
                  const m = parseInt(customMinutes || "0");
                  const s = parseInt(customSeconds || "0");
                  const total = m * 60 + s;
                  if (total > 0) setTimeLeft(total);
                }}
              >
                Set
              </button>
            </div>

            {/* Start / Pause / Reset */}
            <div className="flex gap-3 mb-3">
              <button
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={startTimer}
              >
                Start
              </button>
              <button
                className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={pauseTimer}
              >
                Pause
              </button>
              <button
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={resetTimer}
              >
                Reset
              </button>
            </div>

            {/* Countdown Pill */}
            {timeLeft > 0 && (
              <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                🕒 {formatTime(timeLeft)}
              </div>
            )}
          </div>
        )}

        {/* INPUT BAR */}
        <div className="p-4 border-t border-gray-800 bg-[#111] flex items-center gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.4)]">
          {/* Timer Icon */}
          <button
            onClick={() => setShowTimerTray((prev) => !prev)}
            className="text-gray-300 hover:text-white px-2 text-xl transition-transform hover:scale-110"
            title="Timer"
          >
            🕒
          </button>

          {/* Countdown Pill (collapsed view) */}
          {timeLeft > 0 && !showTimerTray && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
              🕒 {formatTime(timeLeft)}
            </span>
          )}

          {/* Code-block button */}
          <button
            type="button"
            onClick={handleInsertCodeBlock}
            className="
              text-gray-300 
              hover:text-white 
              px-2 
              py-1 
              text-sm 
              font-mono 
              rounded-lg 
              border border-gray-700 
              hover:bg-[#222] 
              transition-colors
            "
            title="Insert code block"
          >
            {"</>"}
          </button>

          {/* Textarea input */}
        <textarea
  ref={textRef}
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Type a message..."
  className="
    flex-1
    bg-[#0f0f0f]
    border border-gray-700
    rounded-xl
    px-4 py-3
    text-gray-200
    placeholder-gray-500
    shadow-inner
    focus:outline-none
    focus:ring-2
    focus:ring-blue-600
    transition-all
    resize-none
    overflow-hidden
    min-h-[40px]
    max-h-[300px]
  "
/>



          <button
            onClick={handleSend}
            disabled={loading}
            className="
              bg-blue-600 
              text-white 
              px-5 py-2.5 
              rounded-xl 
              hover:bg-blue-500 
              transition-all 
              shadow-lg 
              hover:shadow-blue-500/20
              disabled:opacity-60
            "
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
