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
import helmet from "helmet";
import settingsRoutes from "./routes/userSettings.js";
import multer from "multer";
import { register } from "./controllers/auth.js";
import { requireAuth } from "./middlewares/auth.js";
import { validateRegister } from "./middlewares/validators.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
// Express 5 leaves req.body undefined when there is no body; handlers expect an object
app.use((req, res, next) => {
  req.body ??= {};
  next();
});
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
app.use(errorHandler);

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
