import Groq from "groq-sdk";
import config from "../../config/index.js";
import Memory from "../../models/Memory.js";

const groq = new Groq({ apiKey: config.groq.apiKey });

const CONFIDENCE_THRESHOLD = 0.85;

const EXTRACTION_PROMPT = `You are a memory extraction system. Analyze the user's messages and extract important, lasting facts about them.

Focus ONLY on high-value persistent information such as:
- Programming languages or frameworks they use or prefer
- Projects they are working on
- Technologies they favor  
- Their writing style or communication preferences
- Goals or things they are learning
- Professional context (e.g., "I'm building a SaaS", "I work in finance")
- Personal preferences relevant to an AI assistant

Do NOT extract:
- Transient information (weather, what they ate, temporary tasks)
- Opinions that may change frequently
- Information about other people

Return a JSON array of memory objects. Each object must have:
- "category": one of ["preference", "project", "coding_language", "writing_style", "technology", "fact", "goal"]
- "content": a concise fact in third-person (e.g., "User prefers Python over JavaScript")
- "confidence": a number between 0 and 1

Return ONLY valid JSON. No explanation. No markdown. Example:
[{"category":"coding_language","content":"User prefers Python for backend development","confidence":0.92}]

If no high-confidence memories found, return an empty array: []`;

/**
 * Asynchronously extracts persistent facts about the user from their recent messages
 * and saves any high-confidence memories to the database.
 *
 * Fire-and-forget — must never block chat responses.
 *
 * @param {mongoose.Types.ObjectId} userId - The user's ID
 * @param {string[]} userMessages - Array of recent user message strings
 * @param {string} threadId - Source thread ID for traceability
 */
export const extractMemoriesAsync = (userId, userMessages, threadId) => {
  if (!userId || !userMessages?.length) return;

  // Concatenate recent user messages as context (cap at 3000 chars)
  const context = userMessages
    .slice(-5)
    .join("\n")
    .slice(0, 3000);

  // Fire and forget
  (async () => {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          { role: "user", content: `User messages:\n${context}` },
        ],
        max_tokens: 500,
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices?.[0]?.message?.content?.trim();
      if (!raw) return;

      // Handle both array and {memories:[...]} shaped responses
      let extracted = JSON.parse(raw);
      if (!Array.isArray(extracted)) {
        extracted = extracted.memories || extracted.memory || [];
      }

      for (const item of extracted) {
        if (
          typeof item.content !== "string" ||
          !item.content.trim() ||
          typeof item.confidence !== "number" ||
          item.confidence < CONFIDENCE_THRESHOLD
        ) continue;

        // Upsert: update confidence if content already exists, otherwise insert
        await Memory.updateOne(
          { userId, content: item.content.trim() },
          {
            $set: {
              category: item.category || "fact",
              confidence: item.confidence,
              source: threadId,
            },
          },
          { upsert: true }
        );
      }
    } catch (err) {
      console.error("[MemoryExtractor] extraction failed:", err.message);
    }
  })();
};

/**
 * Retrieves all high-confidence memories for a user and formats them as
 * a system prompt injection block.
 *
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<string>} A formatted context string to prepend to the AI system prompt
 */
export const buildMemoryContext = async (userId) => {
  if (!userId) return "";

  try {
    const memories = await Memory.find({
      userId,
      confidence: { $gte: CONFIDENCE_THRESHOLD },
    })
      .sort({ confidence: -1, updatedAt: -1 })
      .limit(20)
      .lean();

    if (!memories.length) return "";

    const lines = memories.map((m) => `- [${m.category}] ${m.content}`).join("\n");
    return `<user_context>\nThe following facts are known about this user:\n${lines}\n</user_context>`;
  } catch {
    return "";
  }
};
