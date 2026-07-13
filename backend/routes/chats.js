import express from "express";
import {
  createTestThread,
  getAllThreads,
  getThreadMessages,
  deleteThread,
  chatWithThread,
} from "../controllers/chatController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateChatRequest, validateThreadParam } from "../middleware/validateRequest.js";

const router = express.Router();

router.post("/test", protect, asyncHandler(createTestThread));
router.get("/thread", protect, asyncHandler(getAllThreads));
router.get("/thread/:threadId", protect, validateThreadParam, asyncHandler(getThreadMessages));
router.delete("/thread/:threadId", protect, validateThreadParam, asyncHandler(deleteThread));
router.post("/chat", protect, validateChatRequest, asyncHandler(chatWithThread));

export default router;