import { PrismaClient } from "@prisma/client";
import { getAIResponse } from "../../services/aiService";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function getUserIdFromToken(authHeader: string | null): string | null {
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        return decoded.id;
    } catch {
        return null;
    }
}

const prisma = new PrismaClient();

/** --------------------------------------------------
 * CORS HEADERS
 * -------------------------------------------------- */
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/** --------------------------------------------------
 * OPTIONS (Preflight)
 * -------------------------------------------------- */
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const authHeader = req.headers.get("Authorization");
    const userId = getUserIdFromToken(authHeader);

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders
      });
    }

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required." }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Extract sessionId from URL
    const { searchParams } = new URL(req.url);
    let sessionId = searchParams.get("sessionId");

    // Create new session if none exists
    if (!sessionId) {
      const session = await prisma.chatSession.create({
        data: { userId, title: prompt }
      });
      sessionId = session.id;
    }

    // Generate AI response (with full memory)
    const aiResponse = await getAIResponse(prompt, sessionId);

    // Save user + bot messages
    const saved = await prisma.chat.create({
      data: {
        userId,
        sessionId,
        prompt,
        response: JSON.stringify(aiResponse)   // 🔥 Save JSON as string
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        aiResponse,
        sessionId,
        metadata: { savedId: saved.id }
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    console.error("Error in POST /askAI:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders
    });
  } finally {
    await prisma.$disconnect();
  }
}

/** --------------------------------------------------
 * GET — Get Chat History
 * -------------------------------------------------- */
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const userId = getUserIdFromToken(authHeader);

        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: corsHeaders,
            });
        }

        const allChats = await prisma.chat.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" },
        });

        return new Response(
            JSON.stringify({
                success: true,
                chats: allChats.map(chat => ({
                    id: chat.id,
                    prompt: chat.prompt,
                    response: chat.response,
                    createdAt: chat.createdAt,
                })),
            }),
            {
                status: 200,
                headers: corsHeaders,
            }
        );

    } catch (error) {
        console.error("Error getting chat history:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: corsHeaders,
        });
    } finally {
        await prisma.$disconnect();
    }
}
