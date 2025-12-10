⚙️ Tech Stack
Frontend

Next.js 14 (App Router)

React

TailwindCSS

Axios

TypeScript

Backend

Next.js Route Handlers

Prisma ORM

PostgreSQL

JWT Authentication

OpenAI API (AI responses)

🔧 Prerequisites

Install the following before running OA-Trax:

Node.js 18+

npm

PostgreSQL (Neon, Supabase, Railway, or local)

🧪 Local Development Setup
1️⃣ Clone the Repo
git clone <repo-url>
cd oa-trax

2️⃣ Install Dependencies
Backend:
cd apps/backend
npm install

Frontend:
cd apps/web
npm install

3️⃣ Add Environment Variables
📌 Backend → /apps/backend/.env

Create the file:

DATABASE_URL="your-postgres-url"
JWT_SECRET="your-secret-key"


Example:

DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
JWT_SECRET="supersecret123"

📌 Frontend → /apps/web/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

4️⃣ Initialize the Database (Prisma)
cd apps/backend
npx prisma migrate dev --name init


This will generate tables for Users, Sessions, and Messages.

5️⃣ Run the Backend
cd apps/backend
npm run dev


Backend starts on:

http://localhost:3001


Test it:

http://localhost:3001/api/users/test

6️⃣ Run the Frontend
cd apps/web
npm run dev


Frontend starts on:

http://localhost:3000


Open the browser to begin using the app.

🧠 How OA-Trax AI Modes Work
🎓 Tutor Mode

Follows the custom Trax “Zero-to-Flow Method”:

Ask the user to re-explain the problem

Identify input → output → constraints

Identify the data structure

Generate algorithm steps

Guide without giving answers

Provide encouragement + educational reinforcement

🎤 Interview Mode

Simulates a real coding interview:

Gives the user a LeetCode-style prompt

Requires explanation of thought process

Expects algorithm + verbal communication

Evaluates clarity and correctness

🤖 Assistant Mode

General coding helper:

Explains concepts

Helps debug

Gives examples

No teaching structure required

🗂️ Session & Chat System

OA-Trax automatically:

Creates a new session when a user clicks “+ New Chat”

Saves all messages to the database

Shows session titles + last message preview

Allows deletion with a confirmation popup

All sessions are associated with the authenticated user via JWT.

🛡 Authentication Flow

User signs up

Backend verifies + hashes password

Returns JWT

Frontend stores JWT in localStorage

All protected routes require:

Authorization: Bearer <token>


Backend decodes → identifies userId → continues normally

🧹 Common Issues & Fixes
❌ Backend returns 404 / undefined route

Environment variable missing:

NEXT_PUBLIC_BACKEND_URL

❌ Prisma cannot connect

Check:

DATABASE_URL

❌ “next is not recognized” on backend

Run:

cd apps/backend
npm install next

❌ AI not responding

Make sure your OpenAI key is configured in backend (if required).

📦 Deployment Strategy

To avoid reconfiguring on new devices:

Create cloud Postgres DB (Neon/Supabase)

Host backend on Vercel or Railway

Host frontend on Vercel

Keep .env.production files in each service

Deploy early and separate frontend + backend for portability.

⭐ Future Enhancements

Code execution sandbox

Built-in LeetCode problem library

User metrics + difficulty tracking

Multi-step solution grading

Enhanced animations for mode switching

Real interview scoring metrics

🧑‍💻 Contributing

Contributions welcome!
Feel free to fork, open issues, or submit PRs.

📄 License

MIT License — free to use and modify.