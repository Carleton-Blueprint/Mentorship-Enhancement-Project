import express from "express";
export const defaultRouter = express.Router();

import {
  insertManyStudents
} from "../controllers/default_controller.js";

import {
  insertStudent
} from "../controllers/student_controller.js"

defaultRouter.post('/insertStudents', insertManyStudents);
defaultRouter.post('/insertStudent', insertStudent);