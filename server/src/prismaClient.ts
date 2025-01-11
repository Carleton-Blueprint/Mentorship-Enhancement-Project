import { PrismaClient } from "@prisma/client";

// Prevent multiple instances during development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Add connection retry logic
prisma
  .$connect()
  .then(() => {
    console.log("Successfully connected to database");
  })
  .catch((e) => {
    console.error("Failed to connect to database:", e);
    process.exit(1); // Exit if we can't connect
  });

// Add disconnect handling
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
