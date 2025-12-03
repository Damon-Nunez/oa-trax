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
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}

/** --------------------------------------------------
 * POST — Create Chat
 * -------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const authHeader = req.headers.get("Authorization");
    const userId = getUserIdFromToken(authHeader);

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required." }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { searchParams } = new URL(req.url);
    let sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      const newSession = await prisma.chatSession.create({
        data: {
          userId,
          title: prompt, // first message becomes session title
        },
      });
      sessionId = newSession.id;
    }

    const aiResponse = await getAIResponse(prompt);

 
    const savedChat = await prisma.chat.create({
      data: {
        userId,
        prompt,
        response: aiResponse,
        sessionId,
      },
    });


    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        title: prompt, // overwrite only if empty
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        prompt,
        aiResponse,
        sessionId, // return so frontend always knows which session to continue
        metadata: { savedId: savedChat.id, createdAt: savedChat.createdAt },
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error creating chat:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
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
