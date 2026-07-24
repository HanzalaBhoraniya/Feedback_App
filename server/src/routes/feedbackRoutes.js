import express from "express";
import {
  getBusinessData,
  getFeedbackFeed,
  getFormData,
  postFormData,
} from "../controller/feedbackController.js";
import authenticate from "../middleware/authMiddleware.js";
import asyncWrap from "../utils/asyncWrap.js";

const router = express.Router();

router.get("/", authenticate, asyncWrap(getBusinessData));
router.get("/feed", authenticate, asyncWrap(getFeedbackFeed));
router.get("/:id", asyncWrap(getFormData));
router.post("/:id", asyncWrap(postFormData));

export default router;
