import mongoose from "mongoose";
import bcrypt from "bcrypt";

const preferencesSchema = new mongoose.Schema(
  {
    theme: { type: String, default: "dark" },
    language: { type: String, default: "en" },
    temperature: { type: Number, default: 0.7, min: 0, max: 2 },
    maxTokens: { type: Number, default: 2048, min: 256, max: 8192 },
    speechEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    provider: { type: String, default: "groq" },
    model: { type: String, default: "llama-3.1-8b-instant" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: 6,
      required() {
        return !this.firebaseUid;
      },
    },
    firebaseUid: {
      type: String,
      sparse: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ["local", "google", "firebase"],
      default: "local",
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
