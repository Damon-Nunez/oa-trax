import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const test = await prisma.chat.create({
    data: {
      prompt: "Hello DB?",
      response: "Yes, I'm connected!"
    }
  });

  console.log("Inserted row:", test);
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
