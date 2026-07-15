import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    content: { type: String },
    type: { type: String, enum: ["image", "pdf", "text", "file"], default: "file" },
  },
  { _id: false }
);

const reactionSchema = new mongoose.Schema(
  {
    emoji: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    attachments: { type: [attachmentSchema], default: [] },
    isPinned: { type: Boolean, default: false },
    bookmarked: { type: Boolean, default: false },
    reactions: { type: [reactionSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const threadSchema = new mongoose.Schema(
  {
    threadId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    provider: { type: String, trim: true },
    model: { type: String, trim: true },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    isPinned: { type: Boolean, default: false, index: true },
    isFavorite: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false },
    folder: { type: String, trim: true, index: true },
    tags: { type: [String], default: [] },
    lastMessage: { type: String, trim: true },
    messageCount: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

threadSchema.index({ updatedAt: -1 });
threadSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
threadSchema.index({ owner: 1, isPinned: -1, updatedAt: -1 });
threadSchema.index({ tags: 1 });

export default mongoose.model("Thread", threadSchema);
