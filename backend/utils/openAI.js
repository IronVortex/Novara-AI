import "dotenv/config";
import express from "express";
import groq from "groq"; 

const app = express();
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: userMessage }
      ],
      model: "llama-3.1-8b-instant",
    });

    res.json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

