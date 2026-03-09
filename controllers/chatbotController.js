import { asyncHandler } from "../middlewares/errorHandler.js";

export const chatbotQuery = asyncHandler(async (req, res) => {
  const { message, context } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Message is required",
    });
  }

  // Placeholder for chatbot integration
  const farmingKeywords = {
    water: "Water your plants when the top inch of soil is dry. Tomatoes need 1-2 inches per week.",
    fertilizer: "Use balanced NPK fertilizer (10-10-10) every 2-3 weeks during growing season.",
    pest: "Use neem oil or organic insecticides. Remove affected leaves manually.",
    disease: "Ensure good air circulation and avoid overhead watering to prevent fungal diseases.",
  };

  let response = "I'm here to help with farming questions!";
  const lowerMessage = message.toLowerCase();

  for (const [key, answer] of Object.entries(farmingKeywords)) {
    if (lowerMessage.includes(key)) {
      response = answer;
      break;
    }
  }

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
  // Placeholder: In production, store/retrieve from database
  const history = [];

  res.status(200).json({
    success: true,
    message: "Chat history retrieved",
    data: history,
  });
});
