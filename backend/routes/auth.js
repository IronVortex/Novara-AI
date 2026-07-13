import express from "express";
import { getMe, loginUser, logoutUser, registerUser } from "../controllers/authController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateLogin, validateRegister } from "../middleware/validateAuth.js";

const router = express.Router();

router.post("/register", validateRegister, asyncHandler(registerUser));
router.post("/login", validateLogin, asyncHandler(loginUser));
router.get("/me", protect, asyncHandler(getMe));
router.post("/logout", protect, asyncHandler(logoutUser));

export default router;
