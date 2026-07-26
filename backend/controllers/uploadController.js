import { analyzeImage } from "../services/ai/visionService.js";
import pdfParse from "pdf-parse";
export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const mimeType = req.file.mimetype || "application/octet-stream";
  const filename = req.file.originalname || "upload";
  let content = "";
  let visionMeta = null;

  if (mimeType === "application/pdf") {
    const { default: pdfParse } = await import("pdf-parse");
    const parsed = await pdfParse(req.file.buffer);
    content = parsed.text || "";
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.toLowerCase().endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    content = result.value || "";
  } else if (mimeType.startsWith("image/")) {
    // Run vision analysis — this extracts real content from the image for chat context
    const vision = await analyzeImage(req.file.buffer, mimeType, filename);
    content = vision.fullContext;
    visionMeta = {
      description: vision.description,
      ocrText: vision.ocrText,
      objects: vision.objects,
      summary: vision.summary,
    };
  } else {
    // Plain text, Markdown, CSV, etc.
    content = req.file.buffer.toString("utf8");
  }

  const type = mimeType.startsWith("image/")
    ? "image"
    : mimeType === "application/pdf"
    ? "pdf"
    : "text";

  res.json({
    success: true,
    attachment: {
      name: filename,
      mimeType,
      content: content.slice(0, 12000),
      type,
      ...(visionMeta && { vision: visionMeta }),
    },
  });
};
