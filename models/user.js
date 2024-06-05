import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  picturePath: {
    type: String,
    default: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);
export default User;
