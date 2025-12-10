import { PrismaClient } from "@prisma/client";
import { getAIResponse } from "../../services/aiService";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import OpenAI from "openai";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ----------------------------
// Decode user token
// ----------------------------
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

// ----------------------------
// CORS
// ----------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// ============================================================
// **TITLE GENERATOR — Uses same API as your aiService**
// ============================================================
async function generateTitle(firstUserMsg: string, firstAiMsg: string) {
  const prompt = `
Generate a short 3–6 word title summarizing this coding discussion.
It must be descriptive, not cute.

User said:
${firstUserMsg}

AI replied:
${firstAiMsg}

Return ONLY the title text.
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Generate short, direct titles. 3–6 words only." },
      { role: "user", content: prompt }
    ],
    max_tokens: 20
  });

  return res.choices[0].message.content?.trim() || "New Chat";
}

// ============================================================
// POST — MAIN ASK AI ROUTE
// ============================================================
export async function POST(req: Request) {
  const prisma = new PrismaClient();

  try {
    const { prompt } = await req.json();
    const authHeader = req.headers.get("Authorization");

    const userId = getUserIdFromToken(authHeader);
    if (!userId)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });

    if (!prompt)
      return new Response(JSON.stringify({ error: "Prompt required" }), {
        status: 400,
        headers: corsHeaders,
      });

    // extract sessionId
    const { searchParams } = new URL(req.url);
    let sessionId = searchParams.get("sessionId");

    let session = null;

    // ALWAYS fetch or create a session
    if (!sessionId) {
      session = await prisma.chatSession.create({
        data: { userId, title: null },
      });
      sessionId = session.id;
    } else {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });

      // if ID invalid, create a fresh one
      if (!session) {
        session = await prisma.chatSession.create({
          data: { userId, title: null },
        });
        sessionId = session.id;
      }
    }

    // 1) Generate AI response
    const aiResponse = await getAIResponse(prompt, sessionId);

    // 2) Save user+bot messages
    const saved = await prisma.chat.create({
      data: {
        userId,
        sessionId,
        prompt,
        response: JSON.stringify(aiResponse),
      },
    });

    // 3) Generate title IF none exists
    if (!session.title) {
      const newTitle = await generateTitle(prompt, aiResponse.reply);

      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: newTitle },
      });

      // Make sure frontend receives the new title immediately
      session.title = newTitle;
    }

    return new Response(
      JSON.stringify({
        success: true,
        aiResponse,
        sessionId,
        title: session.title,
        metadata: { savedId: saved.id },
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Error in askAI:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
