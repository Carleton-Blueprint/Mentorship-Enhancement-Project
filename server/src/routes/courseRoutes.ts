import express from "express";
export const courseRouter = express.Router();

import {
    addCourse
} from "../controllers/course_controller.js";

courseRouter.post('/addCourse', addCourse);