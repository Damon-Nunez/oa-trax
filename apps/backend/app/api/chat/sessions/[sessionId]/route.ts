import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

function getUserIdFromToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request, { params }: { params: { sessionId: string } }) {
  try {
    const authHeader = req.headers.get("Authorization");
    const userId = getUserIdFromToken(authHeader);
    const { sessionId } = await params;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    const chats = await prisma.chat.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    return new Response(JSON.stringify({ chats }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("Error fetching session messages:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  } finally {
    await prisma.$disconnect();
  }

}



export async function DELETE(req:Request, { params }: { params: { sessionId: string} }){
try {
  const authHeader = req.headers.get("Authorization");
    const userId = getUserIdFromToken(authHeader);
    const { sessionId } = await params;

       if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    const deletedChats = await prisma.chat.deleteMany({
    where: { sessionId }
    })

    const deletedSession = await prisma.chatSession.delete({
    where: { id: sessionId }

    })

    return new Response(JSON.stringify({message: "Session deleted successfully"}), {
      status:200,
      headers:corsHeaders
    })


}catch(err) {
     console.error("Error deleting session messages or deleting the session", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
}finally {
  await prisma.$disconnect();
}
}