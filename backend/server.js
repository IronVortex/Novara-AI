import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.listen(5000, () => {
  console.log("Server running on port 5000");
  connectDB();
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const connectDB = async () => {
  try{
    await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB database !!!");
    }
    catch (err) {
      console.log("Error connecting to MongoDB database:",err);
    }
  }
