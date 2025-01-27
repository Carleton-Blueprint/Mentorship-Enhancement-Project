import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
    });
  }
  return prisma;
};

export const withPrisma = async <T>(operation: (client: PrismaClient) => Promise<T>): Promise<T> => {
  const client = getPrismaClient();
  try {
    return await operation(client);
  } catch (error) {
    console.error("Error during Prisma operation:", error);
    throw error;
  }
};

export default getPrismaClient();
