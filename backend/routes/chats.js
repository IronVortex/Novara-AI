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
  regenerateResponse,
  updateMessageMeta,
  updateThread,
  uploadDocument,
} from "../controllers/chatController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateChatRequest, validateThreadParam } from "../middleware/validateRequest.js";

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
router.post("/regenerate", protect, asyncHandler(regenerateResponse));
router.post("/continue", protect, asyncHandler(continueGeneration));
router.post("/edit", protect, asyncHandler(editPrompt));
router.patch("/message", protect, asyncHandler(updateMessageMeta));
router.post("/upload", protect, upload.single("file"), asyncHandler(uploadDocument));

export default router;
