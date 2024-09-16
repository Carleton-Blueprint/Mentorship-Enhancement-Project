import express from "express";
export const authRouter = express.Router();

import {
    loginRoute, registerUser
} from "../controllers/auth_controller.js";

authRouter.post('/login', loginRoute);
authRouter.post('/register', registerUser);