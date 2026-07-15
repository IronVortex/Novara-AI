import express from "express";
import multer from "multer";
import {
  chatWithThread,
  chatWithThreadStream,
  continueGeneration,
  createTestThread,
  deleteThread,
  editPrompt,
  exportThread,
  getAllThreads,
  getThreadMessages,
  guestChatStream,
  regenerateResponse,
  updateMessageMeta,
  updateThread,
  shareThread,
  getSharedThread,
} from "../controllers/chatController.js";
import { uploadDocument } from "../controllers/uploadController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { optionalAuth, protect } from "../middleware/authMiddleware.js";
import { guestLimiter } from "../middleware/rateLimiter.js";
import { validateChatRequest, validateGuestChatRequest, validateThreadParam } from "../middleware/validateRequest.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.post("/test", protect, asyncHandler(createTestThread));
router.get("/thread", protect, asyncHandler(getAllThreads));
router.get("/thread/:threadId", protect, validateThreadParam, asyncHandler(getThreadMessages));
router.get("/thread/:threadId/export", protect, validateThreadParam, asyncHandler(exportThread));
router.patch("/thread/:threadId", protect, validateThreadParam, asyncHandler(updateThread));
router.delete("/thread/:threadId", protect, validateThreadParam, asyncHandler(deleteThread));
router.post("/chat", protect, validateChatRequest, asyncHandler(chatWithThread));
router.post("/chat/stream", protect, validateChatRequest, asyncHandler(chatWithThreadStream));
router.post("/guest/stream", guestLimiter, validateGuestChatRequest, asyncHandler(guestChatStream));
router.post("/regenerate", protect, asyncHandler(regenerateResponse));
router.post("/continue", protect, asyncHandler(continueGeneration));
router.post("/edit", protect, asyncHandler(editPrompt));
router.patch("/message", protect, asyncHandler(updateMessageMeta));
router.post("/upload", optionalAuth, guestLimiter, upload.single("file"), asyncHandler(uploadDocument));
router.post("/thread/:threadId/share", protect, validateThreadParam, asyncHandler(shareThread));
router.get("/share/:threadId", validateThreadParam, asyncHandler(getSharedThread));

export default router;
