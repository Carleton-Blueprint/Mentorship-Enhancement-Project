import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {defaultRouter} from './routes/defaultRoutes.js';
const app = express();
const port = process.env.PORT || 5000;
dotenv.config();
// Middleware for parsing request body
app.use(
  express.json(),
//   cookieParser(),
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:3000"],
    credentials: true,
  })
);
app.use("/students", defaultRouter);

app.listen(port, () => {
  console.log(`App is listening to port: ${port}`);
});