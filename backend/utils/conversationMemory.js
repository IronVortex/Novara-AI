import config from "../config/index.js";

const SYSTEM_PROMPT =
  "You are Novara AI, a helpful assistant. Keep answers clear, accurate, and well-structured. Use markdown when helpful.";

export const estimateTokens = (text = "") => Math.ceil(String(text).length / 4);

export const estimateMessagesTokens = (messages = []) =>
  messages.reduce((total, message) => total + estimateTokens(message.content) + 4, 0);

export const buildContextMessages = (messages = [], summary = "") => {
  const recent = messages.slice(-config.ai.maxContextMessages);
  let tokenBudget = config.ai.maxTokenBudget;
  const selected = [];

  for (let index = recent.length - 1; index >= 0; index -= 1) {
    const message = recent[index];
    const cost = estimateTokens(message.content) + 4;
    if (selected.length > 0 && cost > tokenBudget) break;
    selected.unshift(message);
    tokenBudget -= cost;
  }

  const prompt = [{ role: "system", content: SYSTEM_PROMPT }];

  if (summary?.trim()) {
    prompt.push({
      role: "system",
      content: `Conversation summary so far:\n${summary.trim()}`,
    });
  }

  return [...prompt, ...selected.map((message) => ({ role: message.role, content: message.content }))];
};

export const shouldSummarize = (messageCount) => messageCount >= config.ai.summarizeAfterMessages;

export const buildSummaryPrompt = (messages = []) => [
  {
    role: "system",
    content:
      "Summarize the following conversation in 5-8 concise bullet points. Preserve key facts, decisions, and user preferences.",
  },
  {
    role: "user",
    content: messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n\n")
      .slice(0, 12000),
  },
];
