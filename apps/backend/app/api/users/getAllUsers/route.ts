import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req:Request) {
    try {
        const users = await prisma.user.findMany();

        return NextResponse.json(
            {users},
            {status:201}
        );

    }catch(error) {
console.error("Error getting all Users", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
    }finally {
        await prisma.$disconnect();
    }
}