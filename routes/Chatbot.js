import express from "express";
import { GoogleGenerativeAI } from '@google/generative-ai'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' });

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_KEY)
router.use(cors())

router.post('/', async (req, res) => {
    try {
      console.log(req.body)

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      const chat = model.startChat({
        history: req.body.history,
      })

      const msg = req.body.userInput
      console.log(msg)
      const result = await chat.sendMessage(msg)
      const response = await result.response
      const text = response.text()
      res.send(text)
  
    } catch (error) {
      res.status(500).json({ message: 'Error processing chatbot request', error: error.message });
    }
  });

export default router;
