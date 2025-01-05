import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Add error handling for connection
prisma
  .$connect()
  .then(() => {
    console.log("Successfully connected to database");
  })
  .catch((e) => {
    console.error("Failed to connect to database:", e);
  });

export default prisma;
