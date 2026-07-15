import mongoose from "mongoose";

/**
 * Stores persistent facts the AI has learned about a user across conversations.
 * Each memory record is a single discrete piece of information with a confidence score.
 */
const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["preference", "project", "coding_language", "writing_style", "technology", "fact", "goal"],
      default: "fact",
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.9,
    },
    source: {
      type: String,
      trim: true, // threadId that produced this memory
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate memories per user
memorySchema.index({ userId: 1, content: 1 }, { unique: true });
memorySchema.index({ userId: 1, category: 1 });

export default mongoose.model("Memory", memorySchema);
