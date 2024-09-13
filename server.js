// Must stay the first import: loads .env before any module reads process.env
import "./config.js";
import app from "./app.js";
import connectDB from "./Db/dbconnection.js";

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
