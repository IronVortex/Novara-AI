import express from "express";
import {
  createTestThread,
  getAllThreads,
  getThreadMessages,
  deleteThread,
  chatWithThread,
} from "../controllers/chatController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateChatRequest, validateThreadParam } from "../middleware/validateRequest.js";

const router = express.Router();

router.post("/test", asyncHandler(createTestThread));
router.get("/thread", asyncHandler(getAllThreads));
router.get("/thread/:threadId", validateThreadParam, asyncHandler(getThreadMessages));
router.delete("/thread/:threadId", validateThreadParam, asyncHandler(deleteThread));
router.post("/chat", validateChatRequest, asyncHandler(chatWithThread));

export default router;