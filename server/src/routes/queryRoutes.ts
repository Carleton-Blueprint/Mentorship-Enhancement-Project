import express from "express";
export const queryRouter = express.Router();

import {
    generateCsv
} from "../controllers/query_controller";

queryRouter.get('/generateCsv', generateCsv);