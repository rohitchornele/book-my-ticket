import express, { Router } from "express";
import { getMe, login, logout, register, verifyEmail } from "./auth.controller.js";
import validate from "../common/middleware/validate.middleware.js";
import RegisterDto from "./dto/register.dto.js";
import LoginDto from "./dto/login.dto.js";
import { protect } from "./auth.middleware.js";

const authRouter = Router()

authRouter.post('/sign-up', validate(RegisterDto), register)
authRouter.post('/sign-in', validate(LoginDto), login)
authRouter.get('/verify-email/:token', verifyEmail)
authRouter.get('/me', protect, getMe);
authRouter.post('/logout', protect, logout);

export default authRouter; 


