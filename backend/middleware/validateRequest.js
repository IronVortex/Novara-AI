export const validateChatRequest = (req, res, next) => {
  const { threadId, message } = req.body;

  if (!threadId || typeof threadId !== "string" || !threadId.trim()) {
    return res.status(400).json({ error: "threadId is required and must be a non-empty string" });
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message is required and must be a non-empty string" });
  }

  if (message.length > 5000) {
    return res.status(400).json({ error: "message is too long; please keep it under 5000 characters" });
  }

  req.body.threadId = threadId.trim();
  req.body.message = message.trim();

  next();
};

export const validateThreadParam = (req, res, next) => {
  const { threadId } = req.params;

  if (!threadId || typeof threadId !== "string" || !threadId.trim()) {
    return res.status(400).json({ error: "threadId parameter is required" });
  }

  req.params.threadId = threadId.trim();
  next();
};
