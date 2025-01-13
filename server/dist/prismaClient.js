"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPrisma = void 0;
const client_1 = require("@prisma/client");
// Configure Prisma Client for serverless environment
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
        log: process.env.NODE_ENV === "development"
            ? ["query", "info", "warn", "error"]
            : ["error"],
    });
};
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
// Wrapper function to handle database operations
const withPrisma = async (operation, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Create a new transaction for each operation
            return await prisma.$transaction(async (tx) => {
                return operation(tx);
            }, {
                maxWait: 10000, // 10s maximum wait
                timeout: 30000, // 30s timeout
                isolationLevel: "ReadCommitted",
            });
        }
        catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt === retries) {
                throw error;
            }
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
    throw new Error("All retry attempts failed");
};
exports.withPrisma = withPrisma;
exports.default = prisma;
//# sourceMappingURL=prismaClient.js.map