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

// Add metrics logging
async function logMetrics() {
  const metrics = await prisma.$metrics.json();
  console.dir(metrics, { depth: Infinity });
}

// Add error handling for connection
prisma
  .$connect()
  .then(async () => {
    console.log("Successfully connected to database");
    await logMetrics(); // Log metrics after successful connection
  })
  .catch((e) => {
    console.error("Failed to connect to database:", e);
  });

// Add disconnect handling
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
