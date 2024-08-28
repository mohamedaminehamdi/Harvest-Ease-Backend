import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import connectDB from "./Db/dbconnection.js";
import authRoutes from "./routes/auth.js";
import forumRoutes from "./routes/Forum.js";
import chatbotRoutes from "./routes/Chatbot.js";
import ressourcesRoutes from "./routes/ressources.js";
import schedulerRoutes from "./routes/scheduler.js";
import bodyParser from "body-parser";
import helmet from "helmet";
import settingsRoutes from "./routes/userSettings.js";
import multer from "multer";
import { register } from "./controllers/auth.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// routes with files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
app.post("/auth/register", upload.single("picture"), register);

// routes
app.use("/auth", authRoutes);
app.use("/Forum", forumRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/Resources-tracker", ressourcesRoutes);
app.use("/Farm-scheduler", schedulerRoutes);
app.use("/settings", settingsRoutes);

const PORT = process.env.PORT;
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
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
