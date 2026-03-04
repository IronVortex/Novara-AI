import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import chatRoutes from "./routes/chats.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB database !!!");
  } catch (err) {
    console.log("Error connecting to MongoDB database:", err);
  }
};

app.use("/api/chats", chatRoutes);

app.listen(5000, async () => {
  console.log("Server running on port 5000");
  await connectDB();
});