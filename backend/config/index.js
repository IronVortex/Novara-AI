import dotenv from "dotenv";

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  },
  corsOrigin: process.env.CORS_ORIGIN || "*",
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 120,
  },
  ai: {
    maxContextMessages: Number(process.env.MAX_CONTEXT_MESSAGES) || 20,
    maxTokenBudget: Number(process.env.MAX_TOKEN_BUDGET) || 6000,
    summarizeAfterMessages: Number(process.env.SUMMARIZE_AFTER_MESSAGES) || 24,
  },
};

export const assertConfig = () => {
  const required = ["MONGODB_URI", "JWT_SECRET", "GROQ_API_KEY"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

export default config;
