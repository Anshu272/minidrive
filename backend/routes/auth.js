import express from "express";
import {
  signupController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  logoutController,
  getMe,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);
router.get("/me", authMiddleware, getMe);

export default router;
