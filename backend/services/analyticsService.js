import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, "../../../logs");
const ANALYTICS_FILE = path.join(LOG_DIR, "analytics.jsonl");

/**
 * Formats and records conversation metrics to a local append-only log file.
 */
export const recordMetrics = async ({
  userId = "guest",
  threadId,
  provider = "groq",
  model = "llama-3.1-8b-instant",
  promptTokens = 0,
  completionTokens = 0,
  latencyMs = 0,
}) => {
  const metrics = {
    userId,
    threadId,
    provider,
    model,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    latencyMs,
    timestamp: new Date().toISOString(),
  };

  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    fs.appendFileSync(ANALYTICS_FILE, JSON.stringify(metrics) + "\n");
  } catch (err) {
    console.error("[AnalyticsService] Failed to record metrics:", err.message);
  }
};

/**
 * Returns simple aggregate statistics for a user.
 */
export const getUserStats = async (userId) => {
  if (!userId || !fs.existsSync(ANALYTICS_FILE)) {
    return { totalConversations: 0, totalTokensUsed: 0, averageLatencyMs: 0 };
  }

  try {
    const raw = fs.readFileSync(ANALYTICS_FILE, "utf-8");
    const lines = raw.split("\n").filter(Boolean);
    
    let totalTokens = 0;
    let totalLatency = 0;
    let count = 0;
    const uniqueThreads = new Set();

    for (const line of lines) {
      const entry = JSON.parse(line);
      if (entry.userId.toString() === userId.toString()) {
        totalTokens += entry.totalTokens || 0;
        totalLatency += entry.latencyMs || 0;
        uniqueThreads.add(entry.threadId);
        count++;
      }
    }

    return {
      totalConversations: uniqueThreads.size,
      totalTokensUsed: totalTokens,
      averageLatencyMs: count > 0 ? Math.round(totalLatency / count) : 0,
    };
  } catch {
    return { totalConversations: 0, totalTokensUsed: 0, averageLatencyMs: 0 };
  }
};
