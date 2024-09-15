import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { studentRouter } from "./routes/studentRoutes.js";
import { mentorRouter } from "./routes/mentorRoutes.js";
import {dateRouter} from "./routes/dateRoutes.js";
import {courseRouter} from "./routes/courseRoutes.js"
import {queryRouter} from "./routes/queryRoutes.js"

const app = express();
dotenv.config();
const port = process.env.PORT || 5000;

console.log("entering server");
// Middleware for parsing request body
app.use(
  express.json(),
  //   cookieParser(),
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:3000"],
    credentials: true,
  })
);
app.use("/students", studentRouter);
app.use("/mentors", mentorRouter);
app.use("/date", dateRouter);
app.use("/course", courseRouter);
app.use("/query", queryRouter);

app.listen(port, () => {
  console.log(`App is listening to port: ${port}`);
});
