"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewPrismaClient = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
// Create a new connection for each request
const getNewPrismaClient = () => {
    return new client_1.PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
};
exports.getNewPrismaClient = getNewPrismaClient;
exports.default = prisma;
//# sourceMappingURL=prismaClient.js.map