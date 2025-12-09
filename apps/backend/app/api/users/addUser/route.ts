import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ⭐ OPTIONS (preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// ⭐ POST — Create User
export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: "All fields required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Check existing email
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return new Response(JSON.stringify({ error: "Email already in use" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
      },
    });

    return new Response(
      JSON.stringify({ message: "User created successfully!" }),
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  } finally {
    await prisma.$disconnect();
  }
}