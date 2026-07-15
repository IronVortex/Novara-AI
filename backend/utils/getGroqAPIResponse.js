import Groq from "groq-sdk";
import config from "../config/index.js";
import {
  buildContextMessages,
  buildSummaryPrompt,
  shouldSummarize,
} from "./conversationMemory.js";

const groq = new Groq({ apiKey: config.groq.apiKey });

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 800;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (error) => {
  if (!error) return false;
  const status = error.status || error.statusCode || error?.response?.status;
  return status === 429 || status === 502 || status === 503 || status === 504;
};

const withRetry = async (operation) => {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (isRetryable(err) && attempt < MAX_RETRIES) {
        await sleep(BASE_DELAY_MS * Math.pow(2, attempt));
        continue;
      }
      const error = new Error("Groq API request failed");
      error.status = err.status || err.statusCode || err?.response?.status || 502;
      error.details = err.message;
      throw error;
    }
  }

  throw lastError;
};

export const summarizeConversation = async (messages = []) => {
  if (!messages.length) return "";

  const completion = await withRetry(() =>
    groq.chat.completions.create({
      model: config.groq.model,
      messages: buildSummaryPrompt(messages),
      max_tokens: 400,
    })
  );

  return completion?.choices?.[0]?.message?.content?.trim() || "";
};

export const maybeUpdateSummary = async (thread) => {
  if (!shouldSummarize(thread.messages.length)) return thread.summary || "";

  const olderMessages = thread.messages.slice(0, -config.ai.maxContextMessages);
  if (!olderMessages.length) return thread.summary || "";

  const summary = await summarizeConversation(olderMessages);
  thread.summary = summary;
  return summary;
};

import { buildMemoryContext } from "../services/ai/memoryExtractor.js";

export const getGroqAPIResponse = async (messages = [], summary = "", userId = null) => {
  const memoryContext = userId ? await buildMemoryContext(userId) : "";
  const prompt = buildContextMessages(messages, summary, memoryContext);

  const completion = await withRetry(() =>
    groq.chat.completions.create({
      model: config.groq.model,
      messages: prompt,
    })
  );

  const reply = completion?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("Invalid completion response from Groq API");
  return reply;
};

export async function* streamGroqAPIResponse(messages = [], summary = "", signal = null, userId = null) {
  const memoryContext = userId ? await buildMemoryContext(userId) : "";
  const prompt = buildContextMessages(messages, summary, memoryContext);

  const stream = await withRetry(() =>
    groq.chat.completions.create({
      model: config.groq.model,
      messages: prompt,
      stream: true,
    })
  );

  for await (const chunk of stream) {
    if (signal?.aborted) break;
    const content = chunk?.choices?.[0]?.delta?.content || "";
    if (content) yield content;
  }
}

export default getGroqAPIResponse;
