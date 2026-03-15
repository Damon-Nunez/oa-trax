# OA:Trax

AI-powered coding interview trainer that helps developers practice algorithmic problem solving through **guided hints instead of direct answers**.

Instead of immediately revealing solutions like most practice platforms, OA:Trax encourages users to **think through problems step-by-step**, similar to how a real technical interviewer or mentor would guide them.

---

## Demo

<!-- Replace this with your recorded demo GIF -->

![OA Trax Demo](demo.gif)

---

## Problem

Many developers practice coding interview questions by quickly jumping to the solution.
This often leads to **memorization instead of understanding**.

Effective interview preparation requires:

• Breaking down problems logically
• Exploring multiple solution strategies
• Developing strong algorithmic thinking

---

## Solution

OA:Trax introduces an **AI-driven coaching system** that guides developers through algorithm problems using structured hints.

Rather than providing the full answer immediately, the AI:

• Encourages brainstorming
• Suggests algorithmic approaches
• Gradually reveals deeper hints

This mirrors the experience of working through a problem with a mentor or interviewer.

---

## Features

* AI-assisted hint generation
* Chat-based problem solving interface
* Structured learning workflow
* Clean developer-focused UI
* Interactive algorithm exploration

---

## Tech Stack

### Frontend

Next.js
React
TypeScript
TailwindCSS

### Backend

Node.js
Express

### Database

PostgreSQL
Prisma ORM

### AI Integration

OpenAI API

---

## Architecture Overview

Client (Next.js Frontend)

↓

Express API Server

↓

OpenAI API (Hint Generation)

↓

PostgreSQL Database (via Prisma ORM)

---

## Running the Project Locally

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/OA-Trax
cd OA-Trax
```

### 1. Run the backend

```bash
cd backend
npm install
npm run dev
```

### 2. Run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

### 3. Open the application

Visit the frontend URL shown in your terminal (typically):

```bash
http://localhost:3000
```

---

## Environment Variables

Create a `.env` file inside the **backend directory** and add:

```bash
DATABASE_URL=your_postgres_connection_string
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_secret
```

If the frontend requires environment variables, create a `.env.local` file inside the **frontend directory**.

---

## Future Improvements

* Expanded algorithm problem library
* User progress tracking
* Interview simulation mode
* Multiple hint difficulty levels
* Performance analytics
* Leaderboards and community challenges

---

## Author

Damon Nuñez
Full-Stack Developer

GitHub
https://github.com/Damon-Nunez

LinkedIn
https://linkedin.com/in/damon-nunez
