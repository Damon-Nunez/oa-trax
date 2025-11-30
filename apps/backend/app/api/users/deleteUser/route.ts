import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(req:Request) {
    try {
        const {searchParams} = new URL(req.url);
        const email = searchParams.get("email")

         if(!email) {
              return NextResponse.json(
        { error: "Email is required to delete a user " },
        { status: 400 }
      );
        }

        const deletedUser = await prisma.user.delete({
            where: {
                email:email
            }
        })

        return NextResponse.json(
            {message: "User Deleted"},
            {status:201}
        );

    }catch(error){
        console.error("Error deleting a User", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    ); 
        
    }finally {
        await prisma.$disconnect();
    }
}