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

// Add connection retry logic with exponential backoff
const connectWithRetry = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("Successfully connected to database");
      return;
    } catch (e) {
      console.error(`Failed to connect (attempt ${i + 1}/${retries}):`, e);
      if (i === retries - 1) {
        console.error("Connection details:", {
          host: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0],
          database: process.env.DATABASE_URL?.split("/").pop(),
        });
        process.exit(1); // Exit if all retries failed
      }
      // Longer wait between retries
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 2000)
      );
    }
  }
};

connectWithRetry();

// Add disconnect handling
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
