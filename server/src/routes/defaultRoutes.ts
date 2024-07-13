import express from "express";
export const defaultRouter = express.Router();

import {
  insertManyStudents
} from "../controllers/default_controller.js";

defaultRouter.get('/insertStudents', insertManyStudents);