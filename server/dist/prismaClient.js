"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPrisma = void 0;
const client_1 = require("@prisma/client");
let prisma = null;
const getPrismaClient = () => {
    if (!prisma) {
        prisma = new client_1.PrismaClient({
            log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
        });
    }
    return prisma;
};
const withPrisma = async (operation) => {
    const client = getPrismaClient();
    try {
        return await operation(client);
    }
    catch (error) {
        console.error("Error during Prisma operation:", error);
        throw error;
    }
};
exports.withPrisma = withPrisma;
exports.default = getPrismaClient();
//# sourceMappingURL=prismaClient.js.map