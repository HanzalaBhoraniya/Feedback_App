import {
  setProfile,
  updateProfile,
  verifyProfile,
} from "../controller/businessController.js";
import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import multer from "multer";
import asyncWrap from "../utils/asyncWrap.js";

const storage = multer.memoryStorage(); // telling multer to store files in server's RAM.
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}); // initializing multer. and setting limit to upload max 5mb image.

const router = express.Router();

router.use(authenticate);

router.post("/", upload.single("logo"), asyncWrap(setProfile));
router.put("/", upload.single("newLogo"), asyncWrap(updateProfile));
router.get("/", asyncWrap(verifyProfile));

export default router;
