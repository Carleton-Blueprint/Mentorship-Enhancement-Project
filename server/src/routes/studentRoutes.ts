import express from "express";
export const studentRouter = express.Router();

import {
  insertManyStudents
} from "../controllers/student_controller.js";

studentRouter.post('/insertStudents', insertManyStudents);