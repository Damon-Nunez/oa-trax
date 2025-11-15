import { PrismaClient } from "@prisma/client";
import { getAIResponse } from "../services/aiService"; // make sure this path is correct

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required." }),
        { status: 400 }
      );
    }

    // 1) Get AI response
    const aiResponse = await getAIResponse(prompt);

    // 2) Save to DB
    const savedChat = await prisma.chat.create({
      data: { prompt, response: aiResponse },
    });

    // 3) Return clean JSON with metadata
    return new Response(
      JSON.stringify({
        success: true,
        prompt,
        aiResponse,
        metadata: {
          savedId: savedChat.id,
          createdAt: savedChat.createdAt
        }
      }),
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating chat:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const allChats = await prisma.chat.findMany();

    return new Response(
      JSON.stringify({
        success: true,
        chats: allChats.map(chat => ({
          id: chat.id,
          prompt: chat.prompt,
          response: chat.response,
          createdAt: chat.createdAt
        }))
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error getting chat history:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
