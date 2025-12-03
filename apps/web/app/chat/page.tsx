"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ChatRootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // If not logged in, send to login
    if (!token) {
      router.push("/login");
      return;
    }

    const createSession = async () => {
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

        const sessionId = res.data.sessionId;

        // Redirect to the session page
        router.replace(`/chat/${sessionId}`);
      } catch (error) {
        console.error("Error creating new session:", error);
      }
    };

    createSession();
  }, [router]);

  // This page renders NOTHING — instant redirect
  return null;
}
