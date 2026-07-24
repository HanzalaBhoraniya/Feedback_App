import express from "express";
import { sendOTP, verifyOTP } from "../controller/authController.js";
import asyncWrap from "../utils/asyncWrap.js";
const router = express.Router();

router.post("/send", asyncWrap(sendOTP));
router.post("/verify", asyncWrap(verifyOTP));

export default router;
