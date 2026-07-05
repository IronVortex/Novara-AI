import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getGroqAPIResponse = async (message) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.1-8b-instant",
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error(err);
  }
};

export default getGroqAPIResponse;