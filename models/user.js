import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    userFirstName: { type: String, required: true },
    userLastName: { type: String },
    userAge: { type: Number, required: true }
  });
  
  const User = mongoose.model('User', userSchema);
export default User;