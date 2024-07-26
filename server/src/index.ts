import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {studentRouter} from './routes/studentRoutes.js';
<<<<<<< HEAD
<<<<<<< HEAD
import {mentorRouter} from './routes/mentorRoutes.js';
=======
import {defaultRouter} from './routes/defaultRoutes.js';
=======
>>>>>>> 066c5f6 (changes related to adding mentor as a csv)
import { mentorRouter } from './routes/mentorRoutes.js';
>>>>>>> 295cd87 (mentor controller)
const app = express();
const port = process.env.PORT || 5000;
dotenv.config();

console.log("entering server")
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
<<<<<<< HEAD
<<<<<<< HEAD
app.use("/mentors", mentorRouter);
=======
app.use("/students", defaultRouter);
=======
>>>>>>> 066c5f6 (changes related to adding mentor as a csv)
app.use('/mentors', mentorRouter); // Routes for mentor operations
>>>>>>> 295cd87 (mentor controller)

app.listen(port, () => {
  console.log(`App is listening to port: ${port}`);
});