"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
// Connection management
const connectWithRetry = async (retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$connect();
            console.log("Successfully connected to database");
            return prisma;
        }
        catch (error) {
            console.error(`Failed to connect (attempt ${i + 1}/${retries}):`, error);
            if (i === retries - 1)
                throw error;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
};
// Warm up connection and keep it alive
connectWithRetry().catch((error) => {
    console.error("Failed to establish database connection:", error);
    process.exit(1);
});
// Handle cleanup
process.on("beforeExit", async () => {
    await prisma.$disconnect();
});
exports.default = prisma;
//# sourceMappingURL=prismaClient.js.map