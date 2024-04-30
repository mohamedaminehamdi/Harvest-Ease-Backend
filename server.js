const express = require('express');
const app = express();
const dotenv =require('dotenv')
const cors = require('cors');
const connectDB =require("./Db/dbconnection");
const  authRoutes =require("./routes/auth")
const  ForumRoutes =require("./routes/Forum")
const  ChatBotRoutes= require("./routes/Chatbot")
const  RessourcesRoutes= require("./routes/ressources")
const  ScannerRoutes= require ("./routes/plant-health-scanner")
const  SchedulerRoutes = require ("./routes/scheduler")
dotenv.config();
app.use(cors())
//routes
 app.use("/auth",authRoutes);
 app.use("/Forum",ForumRoutes);
 app.use("/chatbot",ChatBotRoutes);
 app.use("/Resources-tracker",RessourcesRoutes);
 app.use("/Plant-health-scanner",ScannerRoutes);
 app.use("/Farm-scheduler",SchedulerRoutes);
const PORT = process.env.PORT ;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to start server:', err);
    process.exit(1); 
  });