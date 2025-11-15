# Prisma Client Cheatsheet

This is a quick reference for the most commonly used Prisma Client methods for working with models like `User` and `Chat`.

```ts
// =====================
// Creating Records
// =====================

// Create a new user
const newUser = await prisma.user.create({
  data: {
    username: "example",
    email: "example@email.com",
    password: "hashedPassword",
  },
});

// Create a new chat
const newChat = await prisma.chat.create({
  data: {
    prompt: "Hello AI",
    response: "Hi there!",
    userId: "userIdHere",
  },
});

// =====================
// Reading Records
// =====================

// Find all users
const users = await prisma.user.findMany();

// Find a single user by unique field
const user = await prisma.user.findUnique({
  where: { email: "example@email.com" },
});

// Find multiple with filter
const chats = await prisma.chat.findMany({
  where: { userId: "userIdHere" },
});

// =====================
// Updating Records
// =====================

// Update a user
const updatedUser = await prisma.user.update({
  where: { id: "userIdHere" },
  data: { username: "newUsername" },
});

// Update a chat
const updatedChat = await prisma.chat.update({
  where: { id: "chatIdHere" },
  data: { response: "Updated response" },
});

// =====================
// Deleting Records
// =====================

// Delete a user
await prisma.user.delete({
  where: { id: "userIdHere" },
});

// Delete a chat
await prisma.chat.delete({
  where: { id: "chatIdHere" },
});

// =====================
// Authentication / Login Pattern
// =====================

import bcrypt from "bcrypt";

// Step 1: Find the user
const loginUser = await prisma.user.findUnique({
  where: { email: loginEmail },
});

// Step 2: Compare passwords
if (loginUser && await bcrypt.compare(loginPassword, loginUser.password)) {
  // Login successful
} else {
  // Login failed
}

// =====================
// Other Useful Commands
// =====================

// Count records
const userCount = await prisma.user.count();

// Find first record matching criteria
const firstChat = await prisma.chat.findFirst({
  where: { userId: "userIdHere" },
  orderBy: { createdAt: "desc" },
});

// Upsert (update if exists, create if not)
const upsertUser = await prisma.user.upsert({
  where: { email: "example@email.com" },
  update: { username: "newUsername" },
  create: { username: "example", email: "example@email.com", password: "hashed" },
});
