import express from "express";
export const studentRouter = express.Router();

import {
  insertManyStudents, insertStudent,
} from "../controllers/student_controller.js";
import {
  deleteAll
} from "../controllers/reset_student_controller.js";

studentRouter.post('/deleteAllStudents', deleteAll);
studentRouter.post('/insertStudents', insertManyStudents);
studentRouter.post('/insertStudent', insertStudent);