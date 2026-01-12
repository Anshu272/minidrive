import express from "express";
import {
  signupController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  logoutController,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);

export default router;
