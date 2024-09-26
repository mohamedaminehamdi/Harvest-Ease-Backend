import express from "express";
import { GoogleGenerativeAI } from '@google/generative-ai'
import { chatbotQuery, getChatHistory, clearChatHistory, GEMINI_MODEL } from '../controllers/chatbotController.js'

const router = express.Router();
router.post('/query', chatbotQuery);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

// Legacy endpoint used by the old React pages
router.post('/', async (req, res) => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_KEY)
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })
      const chat = model.startChat({
        history: req.body.history,
      })

      const msg = req.body.userInput
      const result = await chat.sendMessage(msg)
      const response = await result.response
      const text = response.text()
      res.send(text)
  
    } catch (error) {
      console.error('Chatbot error:', error);
      res.status(500).json({ message: 'Error processing chatbot request' });
    }
  });

export default router;
