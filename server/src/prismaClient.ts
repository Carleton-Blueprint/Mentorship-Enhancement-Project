import { PrismaClient } from "@prisma/client";

// Configure Prisma Client for serverless environment
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Wrapper function to handle database operations
export const withPrisma = async <T>(
  operation: (client: PrismaClientSingleton) => Promise<T>,
  retries = 3
): Promise<T> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create a new transaction for each operation
      return await prisma.$transaction(
        async (tx) => {
          return operation(tx as unknown as PrismaClientSingleton);
        },
        {
          maxWait: 10000, // 10s maximum wait
          timeout: 30000, // 30s timeout
          isolationLevel: "ReadCommitted",
        }
      );
    } catch (error: any) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
  throw new Error("All retry attempts failed");
};

export default prisma;
