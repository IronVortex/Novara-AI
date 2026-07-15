import jwt from "jsonwebtoken";
import User from "../models/User.js";

const extractBearer = (authorization) => {
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.split(" ")[1];
  }
  return null;
};

const attachUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }
  return user;
};

export const protect = async (req, res, next) => {
  const token = extractBearer(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }

  try {
    req.user = await attachUserFromToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Not authorized, token failed" });
  }
};

/** Attaches req.user when a valid token is present; continues as guest otherwise. */
export const optionalAuth = async (req, res, next) => {
  const token = extractBearer(req.headers.authorization);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    req.user = await attachUserFromToken(token);
  } catch {
    req.user = null;
  }
  next();
};
