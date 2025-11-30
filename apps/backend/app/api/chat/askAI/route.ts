import { PrismaClient } from "@prisma/client";
import { getAIResponse } from "../../services/aiService"; // make sure this path is correct
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function getUserIdFromToken(authHeader: string | null): string | null {
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1]; // "Bearer <token>"
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        return decoded.id;
    } catch {
        return null;
    }
}

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        const authHeader = req.headers.get("Authorization");
        const userId = getUserIdFromToken(authHeader);

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!prompt) return NextResponse.json({ error: "Prompt is required." }, { status: 400 });

        const aiResponse = await getAIResponse(prompt);

        const savedChat = await prisma.chat.create({
            data: { prompt, response: aiResponse, userId },
        });

        return NextResponse.json({
            success: true,
            prompt,
            aiResponse,
            metadata: { savedId: savedChat.id, createdAt: savedChat.createdAt }
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating chat:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}


export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const userId = getUserIdFromToken(authHeader);

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const allChats = await prisma.chat.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" }
        });

        return NextResponse.json({
            success: true,
            chats: allChats.map(chat => ({
                id: chat.id,
                prompt: chat.prompt,
                response: chat.response,
                createdAt: chat.createdAt
            }))
        }, { status: 200 });

    } catch (error) {
        console.error("Error getting chat history:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

