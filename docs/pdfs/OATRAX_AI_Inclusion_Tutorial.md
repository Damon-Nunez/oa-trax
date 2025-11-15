# OA Trax AI Setup (MVP)

This project integrates a simple AI-powered tutor backend using OpenAI's GPT-3.5 Turbo. Users can send a prompt, receive an AI-generated response, and store both in a database. The AI follows the “Trax Method” teaching style: friendly, step-by-step explanations.

---

## 1. API Key Setup
- Sign up for OpenAI and create an API key.
- Store it in your environment variables:

```env
OPENAI_API_KEY=your_api_key_here

---

## 2. AI service.ts!!

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
// creates a client using the AI we have just imported, using the secret key we generated from the site

export async function getAIResponse(userQuestion: string) {
  // System prompt to influence AI behavior
  const systemPrompt = `
    You are a helpful assistant that answers concisely and clearly.
    Be friendly and teach like a tutor with a country accent.
  `;
  

  const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo", // <-- CHEAP MODEL
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuestion }
    ],
    max_tokens: 500, // optional: limits output length to control cost
  });
  // Based on the rules of the API endpoint and defined by what we have... we can feed both of these messages to the API endpoint AI

  // Extract the text content of the first choice
  return response.choices[0].message.content;
}


