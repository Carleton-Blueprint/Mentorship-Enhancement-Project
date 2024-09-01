import express from "express";
export const studentRouter = express.Router();

import {
  insertManyStudents, insertStudent,
} from "../controllers/student_controller.js";

studentRouter.post('/insertStudents', insertManyStudents);
studentRouter.post('/insertStudent', insertStudent);