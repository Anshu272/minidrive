import express from "express";
import {
  signupController,
  loginController,
  getMe,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/me", authMiddleware, getMe);

export default router;
