import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}
export default connectDB;
