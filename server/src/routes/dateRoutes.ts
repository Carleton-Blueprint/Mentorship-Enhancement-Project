import express from "express";
export const dateRouter = express.Router();

import {
    addDateRange
} from "../controllers/date_controller.js";

dateRouter.post('/addDateRange', addDateRange);