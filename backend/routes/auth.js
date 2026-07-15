import express from "express";
import {
  clearAllChats,
  deleteAccount,
  getMe,
  getModels,
  loginUser,
  loginWithFirebase,
  logoutUser,
  registerUser,
  updatePreferences,
  updateProfile,
  migrateGuestThreads,
} from "../controllers/authController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validateLogin, validateRegister } from "../middleware/validateAuth.js";

import { getMyAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.post("/register", authLimiter, validateRegister, asyncHandler(registerUser));
router.post("/login", authLimiter, validateLogin, asyncHandler(loginUser));
router.post("/firebase", authLimiter, asyncHandler(loginWithFirebase));
router.get("/me", protect, asyncHandler(getMe));
router.get("/models", asyncHandler(getModels));
router.post("/logout", protect, asyncHandler(logoutUser));
router.patch("/profile", protect, asyncHandler(updateProfile));
router.patch("/preferences", protect, asyncHandler(updatePreferences));
router.delete("/account", protect, asyncHandler(deleteAccount));
router.delete("/chats", protect, asyncHandler(clearAllChats));
router.post("/migrate-guest", protect, asyncHandler(migrateGuestThreads));
router.get("/analytics", protect, asyncHandler(getMyAnalytics));

export default router;
