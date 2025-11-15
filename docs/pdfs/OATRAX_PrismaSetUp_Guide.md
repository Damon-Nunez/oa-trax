# OA:Trax Backend Setup — PostgreSQL + Prisma

## **1. Purpose of the Backend**
OA:Trax needs to **store chat history and AI-generated teaching sessions** for LeetCode problems.  
We use:

- **PostgreSQL** → reliable relational database  
- **Prisma** → modern TypeScript ORM for managing database tables and queries  

---

## **2. Dependencies Installed**

```bash
npm install prisma --save-dev
npm install @prisma/client
```

- **Prisma CLI** → Tool to manage database schema and migrations  
- **Prisma Client** → TypeScript library for querying the database

---

## **3. Prisma Initialization**

```bash
npx prisma init
```

Creates:

```
prisma/schema.prisma       # Defines database models
.env                       # Stores DATABASE_URL
```

---

## **4. Database Setup**

- Installed PostgreSQL + pgAdmin  
- Created database: `oa_trax_db`  
- Updated `.env`:

```
DATABASE_URL="postgresql://postgres:trax2b@localhost:5432/oa_trax_db"
```

---

## **5. Prisma Schema**

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Chat {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  prompt    String
  response  String
}
```

- **Chat Table Fields:**  
  - `id` → Unique ID (auto-generated)  
  - `createdAt` → Timestamp of creation  
  - `prompt` → User input / problem text  
  - `response` → AI teaching answer  

---

## **6. Migrations — How They Work**

Command:

```bash
npx prisma migrate dev --name init
```

### **What happens:**

1. Prisma reads `schema.prisma`  
2. **Generates SQL** in `prisma/migrations/.../migration.sql`  
3. **Applies SQL** → creates tables in your database  
4. **Generates Prisma Client** → TypeScript code to query tables  

**Key Idea:**  
The migration **automatically builds the database table** based on your schema.  
You don’t manually write SQL.

### **Analogy:**

| Component | Role |
|-----------|------|
| **Schema** | Blueprint of the house |
| **Migration** | Construction crew building the house |
| **Database** | The actual house (tables and data) |
| **Prisma Client** | Tools to safely move furniture in/out (read/write data) |

---

## **7. Testing the Database**

Create `src/testDb.ts`:

```ts
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
```

Run:

```bash
npx ts-node src/testDb.ts
```

✅ Should output an inserted row confirming the DB is connected.

---

## **8. Current Backend State**

- PostgreSQL database running locally  
- `oa_trax_db` exists  
- `Chat` table exists  
- Prisma Client generated  
- `.env` correctly set  

Next steps: create **DB service** + **chat API routes** to save/retrieve user sessions.
