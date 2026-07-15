import Groq from "groq-sdk";
import config from "../../config/index.js";
import Thread from "../../models/Thread.js";

const groq = new Groq({ apiKey: config.groq.apiKey });

/**
 * Asynchronously generates a concise title for a newly created thread
 * using Groq's fast llama-3.1-8b-instant model.
 *
 * This is intentionally fire-and-forget — it must never block the chat stream.
 *
 * @param {string} threadId - The unique ID of the thread to update
 * @param {string} initialMessage - The first user message in the conversation
 */
export const generateTitleAsync = (threadId, initialMessage) => {
  if (!initialMessage || !threadId) return;

  // Fire and forget — deliberately not awaited
  (async () => {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "Generate a title under five words for the following user message. Return the title ONLY. No punctuation. No quotes. No extra text. No explanation.",
          },
          {
            role: "user",
            content: initialMessage.slice(0, 500),
          },
        ],
        max_tokens: 15,
        temperature: 0.3,
      });

      const raw = completion.choices?.[0]?.message?.content?.trim();
      if (!raw) return;

      // Strip any stray punctuation or quotes the model may have still returned
      const title = raw.replace(/^["'`]+|["'`]+$/g, "").replace(/[.!?,]+$/, "").trim();
      if (!title) return;

      await Thread.updateOne({ threadId }, { $set: { title } });
    } catch (err) {
      // Non-critical — log and continue. A failed title is not a show-stopper.
      console.error(`[TitleGenerator] title generation failed for ${threadId}:`, err.message);
    }
  })();
};
