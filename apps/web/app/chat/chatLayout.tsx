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

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

    function cleanPreview(text) {
  try {
    // If it's JSON, parse and extract "reply" or "text"
    const obj = JSON.parse(text);
    return obj.reply || obj.text || text;
  } catch {
    // If not JSON, fallback to plain text
    return text;
  }
}


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
      loadSessions();
      setMobileOpen(false);
    } catch (err) {
      console.error("Error creating new chat:", err);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  // DELETE session handler
  const handleDeleteSession = async () => {
    if (!sessionToDelete || !token) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/sessions/${sessionToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowDeleteConfirm(false);
      setDeleteSuccess(true);

      // Refresh sidebar
      await loadSessions();

      // auto hide popup
      setTimeout(() => setDeleteSuccess(false), 2000);
    } catch (err) {
      console.error("Error deleting session:", err);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">

      {/* HAMBURGER (Mobile Only) */}
      <button
        className="lg:hidden p-3 absolute top-4 left-4 z-30 bg-gray-900 text-white rounded-md"
        onClick={() => setMobileOpen(true)}
      >
        ☰
      </button>

      {/* BACKDROP (mobile only) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      {/* SIDEBAR */}
<aside
  className={`
    bg-[#0a1a2b] text-gray-100 p-4 flex flex-col border-r border-[#05101a]
    w-72 z-30 h-screen transition-transform duration-300
    fixed top-0 left-0
    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 lg:static
  `}
>

  {/* Close button for mobile */}
  <button
    className="lg:hidden mb-3 text-left text-gray-300"
    onClick={() => setMobileOpen(false)}
  >
    ✕ Close
  </button>


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
           <div
  key={s.id}
  className={`relative group flex items-center justify-between p-2 rounded ${
    active ? "bg-gray-700" : "hover:bg-gray-800"
  }`}
>
  {/* LEFT SIDE: TITLE + PREVIEW */}
  <Link
    href={`/chat/${s.id}`}
    onClick={() => setMobileOpen(false)}
    className="flex flex-col w-full mr-2 overflow-hidden"
  >
    <p className="font-semibold text-sm truncate">
      {s.title || "New Chat"}
    </p>

 {s.lastMessage && (
  <p className="text-xs text-gray-400 truncate">
    {typeof s.lastMessage === "string"
      ? cleanPreview(s.lastMessage)
      : cleanPreview(JSON.stringify(s.lastMessage))}
  </p>
)}

  </Link>

  {/* RIGHT SIDE: THREE DOTS */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      setMenuOpenId(menuOpenId === s.id ? null : s.id);
    }}
    className="text-gray-400 hover:text-white px-1"
  >
    ⋮
  </button>
                {/* DROPDOWN */}
                {menuOpenId === s.id && (
               <div
    className="
      absolute 
      right-2 
      top-8 
      bg-[#111] 
      border border-gray-700 
      rounded-lg 
      shadow-lg 
      p-2 
      text-sm
      z-50
    "
  >
                    <button
                      className="w-full text-left hover:bg-red-600 hover:text-white p-1 rounded"
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setSessionToDelete(s.id);
                        setMenuOpenId(null);
                      }}
                    >
                      Delete Session
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded mt-4"
        >
          Logout
        </button>
      </aside>

      {/* MAIN CHAT AREA */}
     <main className="flex-1 bg-[#0c0e11] text-gray-200 p-4 overflow-hidden">
          {children}
          </main>

      {/* CONFIRMATION POPUP */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-bold mb-3">Delete this session?</h2>
            <p className="text-sm mb-4">This cannot be undone.</p>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSession}
                className="px-3 py-1 rounded bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {deleteSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          Session deleted successfully
        </div>
      )}
    </div>
  );
}
