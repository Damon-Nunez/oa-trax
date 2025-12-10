import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateTitle(firstUserMsg: string, firstAiMsg: string) {
  const prompt = `
  Create a short 3–6 word title summarizing this coding conversation.
  The title should be descriptive, not cute.

  User: ${firstUserMsg}
  AI: ${firstAiMsg}

  Return ONLY the title.
  `;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You generate very short, direct titles. 3–6 words only."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 20
  });

  return res.choices[0].message.content?.trim() ?? "New Chat";
}
