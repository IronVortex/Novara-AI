import { v4 as uuidv4 } from "uuid";
import Thread from "../models/Thread.js";
import { clearCache } from "../middleware/cache.js";
import getGroqAPIResponse, {
  maybeUpdateSummary,
  streamGroqAPIResponse,
} from "../utils/getGroqAPIResponse.js";

const threadCachePrefix = (userId) => `threads:${userId}:`;

const findUserThread = (threadId, userId) =>
  Thread.findOne({ threadId, userId });

const invalidateThreadCache = (userId) => clearCache(threadCachePrefix(userId));

const buildAttachmentContext = (attachments = []) => {
  if (!attachments.length) return "";
  return attachments
    .map((file) => `Attachment (${file.name || file.type}):\n${file.content?.slice(0, 4000) || ""}`)
    .join("\n\n");
};

const composeUserMessage = (message, attachments = []) => {
  const attachmentText = buildAttachmentContext(attachments);
  if (!attachmentText) return message;
  return `${message}\n\n${attachmentText}`.trim();
};

const saveAssistantReply = async (thread, reply) => {
  thread.messages.push({ role: "assistant", content: reply });
  await maybeUpdateSummary(thread);
  await thread.save();
  invalidateThreadCache(thread.userId);
  return thread;
};

const loadOrCreateThread = async ({ threadId, userId, message, attachments = [] }) => {
  let thread = await findUserThread(threadId, userId);
  const userContent = composeUserMessage(message, attachments);

  if (!thread) {
    thread = new Thread({
      threadId,
      userId,
      title: message.slice(0, 60).trim() || "New Chat",
      messages: [{ role: "user", content: userContent, attachments }],
    });
  } else {
    thread.messages.push({ role: "user", content: userContent, attachments });
  }

  thread.title = thread.title || message.slice(0, 60).trim() || "New Chat";
  return thread;
};

export const createTestThread = async (req, res) => {
  const thread = await Thread.create({
    threadId: uuidv4(),
    userId: req.user._id,
    title: "Testing New Thread",
    messages: [],
  });

  res.status(201).json({ success: true, data: thread });
};

export const getAllThreads = async (req, res) => {
  const threads = await Thread.find({ userId: req.user._id })
    .sort({ isPinned: -1, isFavorite: -1, updatedAt: -1 })
    .select("threadId title updatedAt isPinned isFavorite tags")
    .lean();

  res.json(threads);
};

export const getThreadMessages = async (req, res) => {
  const thread = await findUserThread(req.params.threadId, req.user._id).lean();

  if (!thread) {
    return res.status(404).json({ error: "Thread not found" });
  }

  res.json({
    messages: thread.messages || [],
    title: thread.title,
    tags: thread.tags || [],
    isPinned: thread.isPinned,
    isFavorite: thread.isFavorite,
    summary: thread.summary || "",
  });
};

export const updateThread = async (req, res) => {
  const { title, isPinned, isFavorite, tags } = req.body;
  const thread = await findUserThread(req.params.threadId, req.user._id);

  if (!thread) {
    return res.status(404).json({ error: "Thread not found" });
  }

  if (typeof title === "string" && title.trim()) thread.title = title.trim();
  if (typeof isPinned === "boolean") thread.isPinned = isPinned;
  if (typeof isFavorite === "boolean") thread.isFavorite = isFavorite;
  if (Array.isArray(tags)) thread.tags = tags.map((tag) => String(tag).trim()).filter(Boolean);

  await thread.save();
  invalidateThreadCache(req.user._id);

  res.json({
    success: true,
    thread: {
      threadId: thread.threadId,
      title: thread.title,
      isPinned: thread.isPinned,
      isFavorite: thread.isFavorite,
      tags: thread.tags,
    },
  });
};

export const deleteThread = async (req, res) => {
  const deletedThread = await Thread.findOneAndDelete({
    threadId: req.params.threadId,
    userId: req.user._id,
  });

  if (!deletedThread) {
    return res.status(404).json({ error: "Thread not found" });
  }

  invalidateThreadCache(req.user._id);

  res.json({
    success: true,
    message: "Thread deleted successfully",
    threadId: deletedThread.threadId,
  });
};

export const chatWithThread = async (req, res) => {
  const { threadId, message, attachments = [] } = req.body;
  const thread = await loadOrCreateThread({
    threadId,
    userId: req.user._id,
    message,
    attachments,
  });

  const assistantReply = await getGroqAPIResponse(thread.messages, thread.summary);
  await saveAssistantReply(thread, assistantReply);

  res.json({
    success: true,
    reply: assistantReply,
    threadId: thread.threadId,
    title: thread.title,
  });
};

export const chatWithThreadStream = async (req, res) => {
  const { threadId, message, attachments = [] } = req.body;
  const thread = await loadOrCreateThread({
    threadId,
    userId: req.user._id,
    message,
    attachments,
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullReply = "";

  try {
    for await (const chunk of streamGroqAPIResponse(thread.messages, thread.summary, req.signal)) {
      fullReply += chunk;
      res.write(`event: chunk\ndata: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    if (fullReply.trim()) {
      await saveAssistantReply(thread, fullReply.trim());
    }

    res.write(
      `event: done\ndata: ${JSON.stringify({
        threadId: thread.threadId,
        title: thread.title,
        reply: fullReply.trim(),
      })}\n\n`
    );
  } catch (error) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    res.end();
  }
};

export const regenerateResponse = async (req, res) => {
  const { threadId, messageIndex } = req.body;
  const thread = await findUserThread(threadId, req.user._id);

  if (!thread) return res.status(404).json({ error: "Thread not found" });

  const targetIndex =
    typeof messageIndex === "number"
      ? messageIndex
      : thread.messages.map((m) => m.role).lastIndexOf("assistant");

  if (targetIndex < 0 || thread.messages[targetIndex]?.role !== "assistant") {
    return res.status(400).json({ error: "No assistant message to regenerate" });
  }

  thread.messages = thread.messages.slice(0, targetIndex);
  const assistantReply = await getGroqAPIResponse(thread.messages, thread.summary);
  await saveAssistantReply(thread, assistantReply);

  res.json({ success: true, reply: assistantReply, messages: thread.messages });
};

export const continueGeneration = async (req, res) => {
  const { threadId } = req.body;
  const thread = await findUserThread(threadId, req.user._id);

  if (!thread) return res.status(404).json({ error: "Thread not found" });

  const continuationPrompt = [
    ...thread.messages,
    {
      role: "user",
      content: "Continue your previous response from where you stopped. Do not repeat earlier content.",
    },
  ];

  const assistantReply = await getGroqAPIResponse(continuationPrompt, thread.summary);
  const lastMessage = thread.messages[thread.messages.length - 1];

  if (lastMessage?.role === "assistant") {
    lastMessage.content = `${lastMessage.content}\n${assistantReply}`.trim();
  } else {
    thread.messages.push({ role: "assistant", content: assistantReply });
  }

  await thread.save();
  invalidateThreadCache(req.user._id);

  res.json({ success: true, reply: assistantReply, messages: thread.messages });
};

export const editPrompt = async (req, res) => {
  const { threadId, messageIndex, content } = req.body;
  const thread = await findUserThread(threadId, req.user._id);

  if (!thread) return res.status(404).json({ error: "Thread not found" });
  if (typeof messageIndex !== "number" || messageIndex < 0 || messageIndex >= thread.messages.length) {
    return res.status(400).json({ error: "Invalid message index" });
  }

  const target = thread.messages[messageIndex];
  if (target.role !== "user") {
    return res.status(400).json({ error: "Only user prompts can be edited" });
  }

  target.content = content.trim();
  thread.messages = thread.messages.slice(0, messageIndex + 1);

  const assistantReply = await getGroqAPIResponse(thread.messages, thread.summary);
  await saveAssistantReply(thread, assistantReply);

  res.json({ success: true, reply: assistantReply, messages: thread.messages });
};

export const updateMessageMeta = async (req, res) => {
  const { threadId, messageIndex, isPinned, bookmarked, reaction } = req.body;
  const thread = await findUserThread(threadId, req.user._id);

  if (!thread) return res.status(404).json({ error: "Thread not found" });
  const message = thread.messages[messageIndex];
  if (!message) return res.status(400).json({ error: "Invalid message index" });

  if (typeof isPinned === "boolean") message.isPinned = isPinned;
  if (typeof bookmarked === "boolean") message.bookmarked = bookmarked;

  if (reaction?.emoji) {
    const existing = message.reactions.find(
      (item) => item.userId.toString() === req.user._id.toString() && item.emoji === reaction.emoji
    );
    if (existing) {
      message.reactions = message.reactions.filter((item) => item !== existing);
    } else {
      message.reactions.push({ emoji: reaction.emoji, userId: req.user._id });
    }
  }

  await thread.save();
  invalidateThreadCache(req.user._id);
  res.json({ success: true, message });
};

export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  let content = "";
  const mimeType = req.file.mimetype || "application/octet-stream";

  if (mimeType === "application/pdf") {
    const { default: pdfParse } = await import("pdf-parse");
    const parsed = await pdfParse(req.file.buffer);
    content = parsed.text || "";
  } else if (mimeType.startsWith("image/")) {
    content = `[Image uploaded: ${req.file.originalname}]`;
  } else {
    content = req.file.buffer.toString("utf8");
  }

  res.json({
    success: true,
    attachment: {
      name: req.file.originalname,
      mimeType,
      content: content.slice(0, 12000),
      type: mimeType.startsWith("image/") ? "image" : mimeType === "application/pdf" ? "pdf" : "text",
    },
  });
};

export const exportThread = async (req, res) => {
  const thread = await findUserThread(req.params.threadId, req.user._id).lean();
  if (!thread) return res.status(404).json({ error: "Thread not found" });

  const markdown = [
    `# ${thread.title}`,
    "",
    ...thread.messages.map((message) => `## ${message.role === "user" ? "You" : "Novara"}\n\n${message.content}`),
  ].join("\n\n");

  res.json({ success: true, markdown, title: thread.title, threadId: thread.threadId });
};
