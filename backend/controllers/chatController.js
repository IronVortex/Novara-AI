import { v4 as uuidv4 } from "uuid";
import Thread from "../models/Thread.js";
import { clearCache } from "../middleware/cache.js";
import getGroqAPIResponse, {
  maybeUpdateSummary,
  streamGroqAPIResponse,
} from "../utils/getGroqAPIResponse.js";
import { generateTitleAsync } from "../services/ai/titleGenerator.js";
import { extractMemoriesAsync } from "../services/ai/memoryExtractor.js";
import { recordMetrics } from "../services/analyticsService.js";
import { estimateTokens } from "../utils/conversationMemory.js";

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

  if (thread.userId) {
    const userMsgs = thread.messages.filter((m) => m.role === "user").map((m) => m.content);
    extractMemoriesAsync(thread.userId, userMsgs, thread.threadId);
  }

  return thread;
};

const loadOrCreateThread = async ({ threadId, userId, message, attachments = [] }) => {
  let thread = await findUserThread(threadId, userId);
  const userContent = composeUserMessage(message, attachments);
  const isNewThread = !thread;

  if (isNewThread) {
    thread = new Thread({
      threadId,
      userId,
      owner: userId,
      createdBy: userId,
      updatedBy: userId,
      title: "New Chat",
      messages: [{ role: "user", content: userContent, attachments }],
    });
  } else {
    thread.messages.push({ role: "user", content: userContent, attachments });
  }

  // Track whether this is a new thread so callers can trigger async title generation
  thread._isNewThread = isNewThread;
  thread._firstMessage = message;
  return thread;
};

export const createTestThread = async (req, res) => {
  const thread = await Thread.create({
    threadId: uuidv4(),
    userId: req.user._id,
    owner: req.user._id,
    createdBy: req.user._id,
    updatedBy: req.user._id,
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

  const startTime = Date.now();
  const assistantReply = await getGroqAPIResponse(thread.messages, thread.summary, req.user._id);
  const latencyMs = Date.now() - startTime;

  await saveAssistantReply(thread, assistantReply);

  // Fire-and-forget: generate AI title only for new threads
  if (thread._isNewThread) {
    generateTitleAsync(thread.threadId, thread._firstMessage);
  }

  // Fire-and-forget: record analytics
  const promptText = thread.messages[thread.messages.length - 2]?.content || "";
  recordMetrics({
    userId: req.user._id,
    threadId: thread.threadId,
    promptTokens: estimateTokens(promptText),
    completionTokens: estimateTokens(assistantReply),
    latencyMs,
  });

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

  // Standard SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable Nginx buffering for SSE
  res.flushHeaders();

  const startTime = Date.now();
  let fullReply = "";
  let saved = false;

  // Persist whatever has been streamed so far on client disconnect
  const handleDisconnect = async () => {
    if (!saved && fullReply.trim()) {
      saved = true;
      try {
        await saveAssistantReply(thread, fullReply.trim() + " \u2026"); // indicate truncation
      } catch (_) {
        // best-effort on disconnect
      }
    }
  };
  res.on("close", handleDisconnect);

  try {
    for await (const chunk of streamGroqAPIResponse(thread.messages, thread.summary, req.signal, req.user._id)) {
      if (res.writableEnded) break;
      fullReply += chunk;
      res.write(`event: chunk\ndata: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    const latencyMs = Date.now() - startTime;

    if (!saved && fullReply.trim()) {
      saved = true;
      await saveAssistantReply(thread, fullReply.trim());
    }

    // Fire-and-forget: generate AI title only for new threads
    if (thread._isNewThread) {
      generateTitleAsync(thread.threadId, thread._firstMessage);
    }

    // Fire-and-forget: record analytics
    const promptText = thread.messages[thread.messages.length - 2]?.content || "";
    recordMetrics({
      userId: req.user._id,
      threadId: thread.threadId,
      promptTokens: estimateTokens(promptText),
      completionTokens: estimateTokens(fullReply),
      latencyMs,
    });

    if (!res.writableEnded) {
      res.write(
        `event: done\ndata: ${JSON.stringify({
          threadId: thread.threadId,
          title: thread.title,
          reply: fullReply.trim(),
        })}\n\n`
      );
    }
  } catch (error) {
    // AbortError means client cancelled — no need to surface as an error event
    if (error.name !== "AbortError" && !res.writableEnded) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    }
  } finally {
    res.removeListener("close", handleDisconnect);
    if (!res.writableEnded) res.end();
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

  // Trim to just before the last assistant reply
  thread.messages = thread.messages.slice(0, targetIndex);
  const assistantReply = await getGroqAPIResponse(thread.messages, thread.summary, req.user._id);
  await saveAssistantReply(thread, assistantReply);

  res.json({
    success: true,
    reply: assistantReply,
    messages: thread.messages,
    threadId: thread.threadId,
  });
};

export const continueGeneration = async (req, res) => {
  const { threadId } = req.body;
  const thread = await findUserThread(threadId, req.user._id);

  if (!thread) return res.status(404).json({ error: "Thread not found" });

  const lastMessage = thread.messages[thread.messages.length - 1];
  if (lastMessage?.role !== "assistant") {
    return res.status(400).json({ error: "Last message must be from assistant to continue" });
  }

  const continuationPrompt = [
    ...thread.messages,
    {
      role: "user",
      content: "Continue your previous response from where you stopped. Do not repeat earlier content.",
    },
  ];

  const assistantReply = await getGroqAPIResponse(continuationPrompt, thread.summary, req.user._id);

  // Append continuation to the last assistant message seamlessly
  lastMessage.content = `${lastMessage.content}\n${assistantReply}`.trim();

  await thread.save();
  invalidateThreadCache(req.user._id);

  res.json({
    success: true,
    reply: assistantReply,
    messages: thread.messages,
    threadId: thread.threadId,
  });
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

  const assistantReply = await getGroqAPIResponse(thread.messages, thread.summary, req.user._id);
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


export const exportThread = async (req, res) => {
  const thread = await findUserThread(req.params.threadId, req.user._id).lean();
  if (!thread) return res.status(404).json({ error: "Thread not found" });

  const format = req.query.format || "markdown";

  if (format === "json") {
    return res.json({ success: true, format, data: thread });
  }

  if (format === "html") {
    const messageHtml = thread.messages
      .map(
        (m) => `
        <div style="margin-bottom: 20px; padding: 15px; border-radius: 8px; background: ${
          m.role === "user" ? "#2f3136" : "#40444b"
        }; color: #ffffff;">
          <strong>${m.role === "user" ? "You" : "Novara"}</strong>
          <div style="margin-top: 8px; white-space: pre-wrap;">${m.content}</div>
        </div>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${thread.title}</title>
          <meta charset="utf-8">
        </head>
        <body style="font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; background: #36393f; color: #dcddde;">
          <h1>${thread.title}</h1>
          <hr style="border: 0; border-top: 1px solid #4f545c; margin-bottom: 30px;">
          ${messageHtml}
        </body>
      </html>
    `;
    res.setHeader("Content-Type", "text/html");
    return res.send(html);
  }

  // Default: Markdown
  const markdown = [
    `# ${thread.title}`,
    "",
    ...thread.messages.map((message) => `## ${message.role === "user" ? "You" : "Novara"}\n\n${message.content}`),
  ].join("\n\n");

  res.json({ success: true, format, markdown, title: thread.title, threadId: thread.threadId });
};

export const shareThread = async (req, res) => {
  const { threadId } = req.params;
  const { isShared, expiresHours } = req.body;

  const thread = await findUserThread(threadId, req.user._id);
  if (!thread) return res.status(404).json({ error: "Thread not found" });

  thread.isShared = typeof isShared === "boolean" ? isShared : true;
  if (expiresHours && typeof expiresHours === "number") {
    thread.shareExpiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);
  } else {
    thread.shareExpiresAt = null; // indefinite
  }

  await thread.save();
  invalidateThreadCache(req.user._id);

  res.json({
    success: true,
    data: {
      threadId: thread.threadId,
      isShared: thread.isShared,
      shareExpiresAt: thread.shareExpiresAt,
    },
  });
};

export const getSharedThread = async (req, res) => {
  const { threadId } = req.params;
  const thread = await Thread.findOne({ threadId }).lean();

  if (!thread || !thread.isShared) {
    return res.status(404).json({ error: "Shared thread not found or link has expired" });
  }

  if (thread.shareExpiresAt && new Date(thread.shareExpiresAt) < new Date()) {
    return res.status(410).json({ error: "This share link has expired" });
  }

  res.json({
    success: true,
    data: {
      title: thread.title,
      messages: thread.messages || [],
      updatedAt: thread.updatedAt,
    },
  });
};

/**
 * Guest streaming chat — no Mongo persistence.
 * Client supplies recent history; replies are returned via SSE only.
 */
export const guestChatStream = async (req, res) => {
  const { message, history = [], attachments = [] } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const safeHistory = Array.isArray(history)
    ? history
        .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
        .slice(-20)
        .map((item) => ({ role: item.role, content: item.content.slice(0, 12000) }))
    : [];

  const userContent = composeUserMessage(message.trim().slice(0, 12000), attachments);
  const messages = [...safeHistory, { role: "user", content: userContent }];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let fullReply = "";

  try {
    for await (const chunk of streamGroqAPIResponse(messages, "", req.signal)) {
      if (res.writableEnded) break;
      fullReply += chunk;
      res.write(`event: chunk\ndata: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    if (!res.writableEnded) {
      res.write(
        `event: done\ndata: ${JSON.stringify({
          reply: fullReply.trim(),
          guest: true,
        })}\n\n`
      );
    }
  } catch (error) {
    if (error.name !== "AbortError" && !res.writableEnded) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    }
  } finally {
    if (!res.writableEnded) res.end();
  }
};
