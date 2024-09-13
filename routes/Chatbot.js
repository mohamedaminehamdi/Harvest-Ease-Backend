import express from "express";
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_KEY)

router.post('/', async (req, res) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
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
