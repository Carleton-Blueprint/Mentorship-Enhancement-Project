import express from "express";
export const mentorRouter = express.Router();

import {
    insertManyMentors,
    updateMentorByID
} from "../controllers/mentor_controller.js";

mentorRouter.post('/insertMentors', insertManyMentors);
mentorRouter.post('/updateMentorByID', updateMentorByID);