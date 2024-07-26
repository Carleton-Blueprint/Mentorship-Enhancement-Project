import express from "express";
export const mentorRouter = express.Router();

import {
    insertManyMentors
} from "../controllers/mentor_controller.js";

mentorRouter.post('/insertMentors', insertManyMentors);