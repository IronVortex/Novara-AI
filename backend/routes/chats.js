import express from "express";
import Thread from "../models/Thread.js";
import getGroqAPIResponse from "../utils/getGroqAPIResponse.js";

const router = express.Router();

// Test Route
router.post("/test", async (req, res) => {
  try {
    const thread = new Thread({
      threadId: "abc",
      title: "Testing New Thread",
    });

    const response = await thread.save();
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save in DB" });
  }
});

// Get all threads
router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find({}).sort({ updatedAt: -1 });
    res.json(threads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});

// Get messages of one thread
router.get("/thread/:threadId", async (req, res) => {
  try {
    const thread = await Thread.findOne({
      threadId: req.params.threadId,
    });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json(thread.messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

// Delete thread
router.delete("/thread/:threadId", async (req, res) => {
  try {
    const deletedThread = await Thread.findOneAndDelete({
      threadId: req.params.threadId,
    });

    if (!deletedThread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json({
      success: "Thread deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

// Chat
router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    let thread = await Thread.findOne({ threadId });

    if (!thread) {
      thread = new Thread({
        threadId,
        title: message,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      });
    } else {
      thread.messages.push({
        role: "user",
        content: message,
      });
    }

    const assistantReply = await getGroqAPIResponse(message);

    thread.messages.push({
      role: "assistant",
      content: assistantReply,
    });

    thread.updatedAt = new Date();

    await thread.save();

    res.json({
      reply: assistantReply,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

export default router;