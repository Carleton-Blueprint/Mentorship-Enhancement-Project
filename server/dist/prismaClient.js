"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
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
exports.default = prisma;
//# sourceMappingURL=prismaClient.js.map