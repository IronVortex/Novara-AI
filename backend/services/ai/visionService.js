import Groq from "groq-sdk";
import config from "../../config/index.js";

const groq = new Groq({ apiKey: config.groq.apiKey });

/**
 * Analyzes an uploaded image buffer using a Groq vision-capable model.
 * Returns a structured object containing description, OCR text, detected objects, and summary.
 *
 * @param {Buffer} imageBuffer - Raw image bytes
 * @param {string} mimeType - Image MIME type (e.g., "image/jpeg")
 * @param {string} filename - Original filename for context
 * @returns {Promise<{ description: string, ocrText: string, objects: string[], summary: string, fullContext: string }>}
 */
export const analyzeImage = async (imageBuffer, mimeType, filename = "image") => {
  const base64 = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
            {
              type: "text",
              text: `Analyze this image thoroughly. Provide:
1. DESCRIPTION: A detailed visual description of what you see (2-3 sentences)
2. OCR: Any text visible in the image, word for word (or "None" if no text)
3. OBJECTS: A comma-separated list of key objects, people, or elements detected
4. SUMMARY: A one-sentence concise summary of the image

Format your response EXACTLY as:
DESCRIPTION: [description]
OCR: [text or None]
OBJECTS: [item1, item2, item3]
SUMMARY: [summary]`,
            },
          ],
        },
      ],
      max_tokens: 600,
      temperature: 0.1,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || "";
    return parseVisionResponse(raw, filename);
  } catch (err) {
    // Graceful fallback — still provide the filename as context
    return {
      description: `Image file: ${filename}`,
      ocrText: "",
      objects: [],
      summary: `Uploaded image: ${filename}`,
      fullContext: `[Image: ${filename}] (Vision analysis unavailable)`,
    };
  }
};

/**
 * Parses the structured vision model response into clean fields.
 */
const parseVisionResponse = (raw, filename) => {
  const extract = (label) => {
    const match = raw.match(new RegExp(`${label}:\\s*(.+?)(?=\\n[A-Z]+:|$)`, "s"));
    return match?.[1]?.trim() || "";
  };

  const description = extract("DESCRIPTION") || `Image: ${filename}`;
  const ocrText = extract("OCR").replace(/^none$/i, "").trim();
  const objectsRaw = extract("OBJECTS");
  const objects = objectsRaw
    ? objectsRaw.split(",").map((o) => o.trim()).filter(Boolean)
    : [];
  const summary = extract("SUMMARY") || description;

  // Build a rich text context that the chat model can consume
  const parts = [`[Image Analysis: ${filename}]`, `Description: ${description}`];
  if (ocrText) parts.push(`Text in image: ${ocrText}`);
  if (objects.length) parts.push(`Detected objects: ${objects.join(", ")}`);
  parts.push(`Summary: ${summary}`);

  return {
    description,
    ocrText,
    objects,
    summary,
    fullContext: parts.join("\n"),
  };
};
