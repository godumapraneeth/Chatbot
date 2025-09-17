import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables. Check your .env file.");
}

// ✅ This .trim() is the key to solving the problem.
const genAI = new GoogleGenerativeAI(apiKey.trim());

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });