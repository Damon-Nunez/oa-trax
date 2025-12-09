"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

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
// Custom time fields
const [customMinutes, setCustomMinutes] = useState("");
const [customSeconds, setCustomSeconds] = useState("");
const [userMode, setUserMode] = useState("Tutor");



// Format seconds → MM:SS
const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
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
      
      // USER MESSAGE
      loadedMessages.push({
        id: chat.id + "-u",
        text: chat.prompt,
        from: "user" as const,
        mode: null,
        step: null,
        correct: null,
        metadata: null
      });

      // BOT MESSAGE (JSON PARSED)
      let parsedResponse = null;

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
          metadata: null
        };
      }

      loadedMessages.push({
        id: chat.id + "-b",
        text: parsedResponse.reply,
        from: "bot" as const,
        mode: parsedResponse.mode,
        step: parsedResponse.step,
        correct: parsedResponse.correct,
        metadata: parsedResponse.metadata
      });
    }

    // If session empty, add system message
    if (loadedMessages.length === 0) {
      loadedMessages.unshift({
        id: "system-welcome",
        text: "Welcome to OA Trax!",
        from: "system" as const,
        mode: null,
        step: null,
        correct: null,
        metadata: null
      });
    }

    setMessages(loadedMessages);

  } catch (err) {
    console.error("Error loading history:", err);
  }
};


    loadHistory();
  }, [sessionId, token, router]);


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

      setUserMode(res.data.mode);
    } catch (err) {
      console.error("Failed to fetch user mode:", err);
    }
  };

  fetchMode();
}, [token]);


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

       
    return res.data.aiResponse; // <-- Already parsed JSON from backend
    
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

    const userMessage ={
  id: crypto.randomUUID(),
  text: input,
  from: "user" as const,
  mode: null,
  step: null,
  correct: null,
  metadata: null
}

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
    metadata: aiReply.metadata
  },
]);


    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* MODE SELECTOR (temp UI) */}
<div className="p-3 bg-white border-b flex justify-end">
  <select
    value={userMode}
    onChange={async (e) => {
      const newMode = e.target.value;
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
    className="border rounded px-2 py-1"
  >
    <option value="Tutor">Tutor</option>
    <option value="Interview">Interview</option>
    <option value="Assistant">Assistant</option>
  </select>
</div>

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
   {/* TIMER + INPUT BAR AREA */}
<div className="relative">
  {/* Timer Tray (only visible when expanded) */}
 {showTimerTray && (
  <div className="absolute bottom-full left-0 right-0 bg-white border-t border-l border-r shadow-lg p-4 animate-slide-up">
    <h3 className="font-semibold mb-2">Timer</h3>

    {/* Preset buttons */}
    <div className="flex gap-2 mb-3">
      <button
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => setTimeLeft(5 * 60)}
      >
        5 min
      </button>
      <button
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => setTimeLeft(10 * 60)}
      >
        10 min
      </button>
      <button
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
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
        className="w-16 border rounded px-2 py-1"
      />
      <span>:</span>
      <input
        type="number"
        placeholder="sec"
        value={customSeconds}
        onChange={(e) => setCustomSeconds(e.target.value)}
        className="w-16 border rounded px-2 py-1"
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
  <div className="p-4 border-t bg-white flex items-center gap-2">
    {/* Timer Icon */}
    <button
      onClick={() => setShowTimerTray((prev) => !prev)}
      className="text-gray-600 hover:text-gray-900 px-2"
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

    <input
      type="text"
      placeholder="Type a message..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      autoFocus
      className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
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

</div>

  );
}

