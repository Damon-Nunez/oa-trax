# 📘 Trax Self-Test Archive — Schema.prisma (Set 1)

This document contains the exact questions asked and the answers provided by Damon, along with corrected explanations for clarity.

---

## **Q1 — Purpose of the Chat Model**
**Your Answer:**  
The purpose of a chat model is to store information of the user's conversations with the AI. We use `prompt` for their question and `response` for the AI’s answer. We need `userId` to store chats in the user’s personal data, and `sessionId` to save chats in a “session” for returnability.

**Correct Explanation:**  
✔ Exactly right.  
The `Chat` model stores:
- prompt (user’s message)
- response (AI’s message)
- user relationship  
- session relationship  

Each row = one message pair.

---

## **Q2 — Why Are userId and sessionId Optional?**
**Your Answer:**  
We made it optional temporarily for testing but they shouldn’t be.

**Correct Explanation:**  
They *can* be optional in production because:
- Anonymous chats may be allowed  
- Sessions may be created later  
- Development flexibility  
- Prisma allows partial relational data during setup  

They aren't wrong as optional — it’s intentional flexibility.

---

## **Q3 — Order of Field Handling in Prisma**
**Your Answer:**  
Prisma handles it in the order we have it in. It generates most automatically but the user has to provide the prompt and technically userId.

**Correct Explanation:**  
Prisma does **not** follow schema order.  
Correct responsibility:

- **Auto-generated:**  
  - `id` (`@default(cuid())`)  
  - `createdAt` (`@default(now())`)

- **Manual:**  
  - `prompt`  
  - `response`  
  - `userId` (optional)  
  - `sessionId` (optional)

You must pass the content (`prompt/response`) and any relationship IDs.

---

## **Q4 — Meaning of fields / references**
**Your Answer:**  
These arrays represent the relationship between tables. For example `userId` references `id` on the User model.

**Correct Explanation:**  
✔ Correct.

- `fields: [userId]` → The local column acting as the foreign key  
- `references: [id]` → The column in the related model that `userId` must match  

---

## **Q5 — Difference Between userId and user**
**Your Answer:**  
Not fully sure. I guessed userId is the encoded stuff and user might be the username.

**Correct Explanation:**  
- `userId` = scalar string (the raw foreign key)  
- `user` = object relation (the full User record when queried)

Example:
```ts
chat.userId  // string
chat.user    // full User object
