import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, response } = body;

    if (!prompt || !response) {
      return new Response(JSON.stringify({ error: "Both prompt and response are required." }), { status: 400 });
    }

    const newChat = await prisma.chat.create({
      data: { prompt, response },
    });

    return new Response(JSON.stringify(newChat), { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const allChats = await prisma.chat.findMany();
    return new Response(JSON.stringify(allChats), { status: 200 });
  } catch (error) {
    console.error("Error getting chat history:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
