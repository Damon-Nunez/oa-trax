"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface SessionSummary {
  id: string;
  title: string;
  lastMessage: string | null;
  createdAt: string;
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch all sessions for sidebar
  const loadSessions = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Error loading sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Refresh sidebar when navigating to another session
  useEffect(() => {
    loadSessions();
  }, [pathname]);

  // New chat handler
  const handleNewChat = async () => {
    if (!token) return;

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/new`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newSessionId = res.data.sessionId;

      // Immediately go to this new session
      router.push(`/chat/${newSessionId}`);
      loadSessions(); // refresh sidebar
    } catch (err) {
      console.error("Error creating new chat:", err);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="h-screen flex bg-gray-100">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-gray-100 p-4 flex flex-col border-r border-gray-800">
        
        {/* New Chat */}
        <button
          onClick={handleNewChat}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded mb-4"
        >
          + New Chat
        </button>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading && (
            <p className="text-gray-400 text-sm">Loading chats...</p>
          )}

          {!loading && sessions.length === 0 && (
            <p className="text-gray-500 text-sm">No chats yet.</p>
          )}

          {sessions.map((s) => {
            const active = pathname === `/chat/${s.id}`;

            return (
              <Link
                key={s.id}
                href={`/chat/${s.id}`}
                className={`block p-2 rounded ${
                  active ? "bg-gray-700" : "hover:bg-gray-800"
                }`}
              >
                <p className="font-semibold text-sm truncate">
                  {s.title || "New Chat"}
                </p>

                {s.lastMessage && (
                  <p className="text-xs text-gray-400 truncate">
                    {s.lastMessage}
                  </p>
                )}
              </Link>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded mt-4"
        >
          Logout
        </button>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
