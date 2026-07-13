import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 800;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (error) => {
  if (!error) return false;
  const status = error.status || error.statusCode || error?.response?.status;
  return status === 429 || status === 502 || status === 503 || status === 504;
};

const buildPrompt = (message) => [
  {
    role: "system",
    content: "You are a helpful AI assistant. Keep answers concise, polite, and aligned with the user's query.",
  },
  {
    role: "user",
    content: message,
  },
];

const getGroqAPIResponse = async (message) => {
  if (!message || typeof message !== "string") {
    throw Object.assign(new Error("Invalid message payload for AI request"), { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    throw Object.assign(new Error("Missing GROQ_API_KEY in environment"), { status: 500 });
  }

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const completion = await groq.chat.completions.create({
        messages: buildPrompt(message),
        model: MODEL,
      });

      const reply = completion?.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        throw new Error("Invalid completion response from Groq API");
      }

      return reply;
    } catch (err) {
      lastError = err;
      const retryable = isRetryable(err);
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);

      if (retryable && attempt < MAX_RETRIES) {
        console.warn(`Groq retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms`, err.message);
        await sleep(delay);
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

export default getGroqAPIResponse;