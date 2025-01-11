"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Prevent multiple instances during development
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
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
// Add error handling for connection
prisma
    .$connect()
    .then(() => {
    console.log("Successfully connected to database");
})
    .catch((e) => {
    console.error("Failed to connect to database:", e);
});
// Add disconnect handling
process.on("beforeExit", async () => {
    await prisma.$disconnect();
});
exports.default = prisma;
//# sourceMappingURL=prismaClient.js.map