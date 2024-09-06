import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
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
import { requireAuth } from "./middlewares/auth.js";
import { validateRegister } from "./middlewares/validators.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
const assetsDir = path.join(__dirname, "public/assets");
fs.mkdirSync(assetsDir, { recursive: true });
app.use("/assets", express.static(assetsDir));

// routes with files
// Images only, named by us: uploads can't overwrite each other or be served as HTML/JS
const imageTypes = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif" };
const storage = multer.diskStorage({
  destination: assetsDir,
  filename: (req, file, cb) => {
    cb(null, randomUUID() + imageTypes[file.mimetype]);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (imageTypes[file.mimetype]) return cb(null, true);
    const err = new Error("Picture must be a PNG, JPEG, WebP or GIF image");
    err.status = 400;
    cb(err);
  },
});
app.post("/auth/register", upload.single("picture"), validateRegister, register);

// routes
app.use("/auth", authRoutes);
app.use("/Forum", requireAuth, forumRoutes);
app.use("/chatbot", requireAuth, chatbotRoutes);
app.use("/Resources-tracker", requireAuth, ressourcesRoutes);
app.use("/Farm-scheduler", requireAuth, schedulerRoutes);
app.use("/settings", requireAuth, settingsRoutes);

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
