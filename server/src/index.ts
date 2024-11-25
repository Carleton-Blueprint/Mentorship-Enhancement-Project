import dotenv from "dotenv";
import { app } from "./app";
import { exec } from 'child_process';
import prisma from './prismaClient';

dotenv.config();
const port = process.env.PORT || 5000;

async function startServer() {
  try {
    // Run migrations
    exec('npx prisma migrate deploy', (error, stdout, stderr) => {
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
    app.listen(port, () =>
      console.log(`Server running on port ${port}`
    ));
  } catch (error) {
    console.error('Error starting server:', error);
  } finally {
    await prisma.$disconnect();
  }
}

startServer();

module.exports = app
