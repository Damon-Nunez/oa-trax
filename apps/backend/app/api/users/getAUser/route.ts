import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";


const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
    const { searchParams } = new URL(req.url);
const email = searchParams.get("email");

        if(!email) {
              return NextResponse.json(
        { error: "Email is required to find a user " },
        { status: 400 }
      );
        }

        const user = await prisma.user.findUnique({
  where: { email },
});

return NextResponse.json(
    {message: "User Found", user},
    {status:201}
);

    } catch(error) {
        console.error("Error finding the user",error);
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status:500}
        )
    } finally {
        await prisma.$disconnect();
    }
}