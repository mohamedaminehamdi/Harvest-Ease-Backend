import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./Db/dbconnection.js";
import authRoutes from "./routes/auth.js";
import forumRoutes from "./routes/Forum.js";
import chatbotRoutes from "./routes/Chatbot.js";
import ressourcesRoutes from "./routes/ressources.js";
import scannerRoutes from "./routes/plant-health-scanner.js";
import schedulerRoutes from "./routes/scheduler.js";
import bodyParser from "body-parser";
import helmet from "helmet";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use("/auth", authRoutes);
app.use("/Forum", forumRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/Resources-tracker", ressourcesRoutes);
app.use("/Plant-health-scanner", scannerRoutes);
app.use("/Farm-scheduler", schedulerRoutes);

//mongoose setup
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to start server:", err);
    process.exit(1);
  });


  app.use(cors({
    origin: 'http://localhost:3000' 
  }));