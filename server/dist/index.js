"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
const child_process_1 = require("child_process");
const prismaClient_1 = __importDefault(require("./prismaClient"));
dotenv_1.default.config();
const port = process.env.PORT || 5000;
async function startServer() {
    try {
        // Run migrations
        (0, child_process_1.exec)('npx prisma migrate deploy', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running migrations: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Migration stderr: ${stderr}`);
                return;
            }
            console.log(`Migration stdout: ${stdout}`);
        });
        // Start your server here
        console.log('Server is starting...');
        app_1.app.listen(port, () => console.log(`Server running on port ${port}`));
    }
    catch (error) {
        console.error('Error starting server:', error);
    }
    finally {
        await prismaClient_1.default.$disconnect();
    }
}
startServer();
module.exports = app_1.app;
//# sourceMappingURL=index.js.map