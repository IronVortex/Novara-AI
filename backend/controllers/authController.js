import User from "../models/User.js";
import Thread from "../models/Thread.js";
import { comparePassword, createToken } from "../utils/auth.js";
import { getEnabledProviders, getDefaultModel } from "../services/ai/providers.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  provider: user.provider || "local",
  preferences: user.preferences || {},
});

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const user = await User.create({ name, email, password, provider: "local" });
  const token = createToken(user);

  res.status(201).json({
    success: true,
    token,
    user: publicUser(user),
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = createToken(user);

  res.json({
    success: true,
    token,
    user: publicUser(user),
  });
};

/**
 * Exchange a verified Firebase identity for a Novara JWT.
 * Supports email/password (already provisioned in Firebase) and Google.
 */
export const loginWithFirebase = async (req, res) => {
  const { firebaseUid, email, name, provider = "firebase" } = req.body;

  if (!firebaseUid || !email) {
    return res.status(400).json({ error: "firebaseUid and email are required" });
  }

  let user = await User.findOne({
    $or: [{ firebaseUid }, { email: email.toLowerCase() }],
  });

  if (!user) {
    user = await User.create({
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      firebaseUid,
      provider: provider === "google" ? "google" : "firebase",
    });
  } else {
    if (!user.firebaseUid) user.firebaseUid = firebaseUid;
    if (provider === "google") user.provider = "google";
    await user.save();
  }

  const token = createToken(user);

  res.json({
    success: true,
    token,
    user: publicUser(user),
  });
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: publicUser(req.user),
  });
};

export const logoutUser = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

export const updatePreferences = async (req, res) => {
  const allowed = [
    "theme",
    "language",
    "temperature",
    "maxTokens",
    "speechEnabled",
    "notificationsEnabled",
    "provider",
    "model",
  ];

  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[`preferences.${key}`] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select(
    "-password"
  );

  res.json({ success: true, user: publicUser(user) });
};

export const updateProfile = async (req, res) => {
  const { name } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  req.user.name = String(name).trim();
  await req.user.save();

  res.json({ success: true, user: publicUser(req.user) });
};

export const deleteAccount = async (req, res) => {
  const userId = req.user._id;
  await Thread.deleteMany({ userId });
  await User.findByIdAndDelete(userId);
  res.json({ success: true, message: "Account deleted" });
};

export const getModels = async (_req, res) => {
  res.json({
    success: true,
    providers: getEnabledProviders(),
    default: getDefaultModel(),
  });
};

export const clearAllChats = async (req, res) => {
  await Thread.deleteMany({ userId: req.user._id });
  res.json({ success: true, message: "All chats cleared" });
};
