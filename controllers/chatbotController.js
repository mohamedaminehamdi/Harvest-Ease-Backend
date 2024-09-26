import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatMessage from "../models/chatMessage.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAX_MESSAGE_LENGTH = 2000;
const CONTEXT_MESSAGES = 10;

// Used when Gemini isn't configured or fails
const farmingKeywords = {
  water: "Water your plants when the top inch of soil is dry. Tomatoes need 1-2 inches per week.",
  fertilizer: "Use balanced NPK fertilizer (10-10-10) every 2-3 weeks during growing season.",
  pest: "Use neem oil or organic insecticides. Remove affected leaves manually.",
  disease: "Ensure good air circulation and avoid overhead watering to prevent fungal diseases.",
};

const keywordReply = (message) => {
  const lowerMessage = message.toLowerCase();
  const match = Object.entries(farmingKeywords).find(([key]) => lowerMessage.includes(key));
  return match ? match[1] : "I'm here to help with farming questions!";
};

const geminiReply = async (message, history) => {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: "You are HarvestEase, a concise assistant for farmers. Answer farming questions practically.",
  });
  const chat = model.startChat({
    history: history.map((m) => ({ role: m.role === "bot" ? "model" : "user", parts: [{ text: m.content }] })),
  });
  const result = await chat.sendMessage(message);
  return result.response.text();
};

export const chatbotQuery = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user._id;

  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Message is required",
    });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Message must be at most ${MAX_MESSAGE_LENGTH} characters`,
    });
  }

  let response = keywordReply(message);
  if (process.env.GOOGLE_GEN_AI_KEY) {
    const history = (await ChatMessage.find({ userId }).sort({ _id: -1 }).limit(CONTEXT_MESSAGES)).reverse();
    try {
      response = await geminiReply(message, history);
    } catch (error) {
      console.error("Gemini error, using keyword reply:", error.message);
    }
  }

  await ChatMessage.insertMany([
    { userId, role: "user", content: message },
    { userId, role: "bot", content: response },
  ]);

  res.status(200).json({
    success: true,
    message: "Chatbot response",
    data: {
      query: message,
      response,
      timestamp: new Date(),
    },
  });
});

export const getChatHistory = asyncHandler(async (req, res) => {
  const history = (await ChatMessage.find({ userId: req.user._id }).sort({ _id: -1 }).limit(50)).reverse();

  res.status(200).json({
    success: true,
    message: "Chat history retrieved",
    data: history,
  });
});

export const clearChatHistory = asyncHandler(async (req, res) => {
  await ChatMessage.deleteMany({ userId: req.user._id });

  res.status(200).json({
    success: true,
    message: "Chat history cleared",
  });
});
