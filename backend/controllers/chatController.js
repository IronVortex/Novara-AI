import { v4 as uuidv4 } from "uuid";
import Thread from "../models/Thread.js";
import getGroqAPIResponse from "../utils/getGroqAPIResponse.js";

export const createTestThread = async (req, res) => {
  const thread = await Thread.create({
    threadId: uuidv4(),
    title: "Testing New Thread",
    messages: [],
  });

  res.status(201).json({ success: true, data: thread });
};

export const getAllThreads = async (req, res) => {
  const threads = await Thread.find({})
    .sort({ updatedAt: -1 })
    .select("threadId title updatedAt")
    .lean();

  res.json(threads);
};

export const getThreadMessages = async (req, res) => {
  const thread = await Thread.findOne({ threadId: req.params.threadId }).lean();

  if (!thread) {
    return res.status(404).json({ error: "Thread not found" });
  }

  res.json(thread.messages || []);
};

export const deleteThread = async (req, res) => {
  const deletedThread = await Thread.findOneAndDelete({
    threadId: req.params.threadId,
  });

  if (!deletedThread) {
    return res.status(404).json({ error: "Thread not found" });
  }

  res.json({
    success: true,
    message: "Thread deleted successfully",
    threadId: deletedThread.threadId,
  });
};

export const chatWithThread = async (req, res) => {
  const { threadId, message } = req.body;

  let thread = await Thread.findOne({ threadId });

  if (!thread) {
    thread = new Thread({
      threadId,
      title: message.slice(0, 60).trim() || "New Chat",
      messages: [{ role: "user", content: message }],
    });
  } else {
    thread.messages.push({ role: "user", content: message });
  }

  const assistantReply = await getGroqAPIResponse(message);

  thread.messages.push({ role: "assistant", content: assistantReply });
  thread.title = thread.title || message.slice(0, 60).trim() || "New Chat";

  await thread.save();

  res.json({
    success: true,
    reply: assistantReply,
    threadId: thread.threadId,
    title: thread.title,
  });
};
