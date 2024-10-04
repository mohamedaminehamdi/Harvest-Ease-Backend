import express from "express";
const router = express.Router();
import User from "../models/user.js"
import mongoose from "mongoose"
import { changePassword, deleteAccount } from "../controllers/userController.js";

// Users may only modify their own account
const selfOnly = (req, res, next) => {
  if (req.params.userId !== String(req.user._id)) {
    return res.status(403).json({ error: 'Not authorized to modify this user' });
  }
  next();
};

router.get('/users', async (req, res) => {
        try {
          const users = await User.find().select('name picturePath');
          return res.status(200).json({ users });
        } catch (error) {
          console.error('Error getting users:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      ;

});


router.get('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    // Find the user by userId
    const user = await User.findById(userId); // Use findById to fetch the user by ObjectId

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ name: user.name });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// **Update User Credentials (Password Change)** — requires { oldPassword, newPassword }
router.put('/users/:userId', selfOnly, changePassword);

router.put('/users/:userId/email', selfOnly, async (req, res) => {
  try {
    const { newEmail } = req.body;

    // Validate new email
    if (!newEmail) {
      return res.status(400).json({ error: 'New email is required' });
    }
    // Find the user by ObjectId and update the email
    const user = await User.findByIdAndUpdate(req.user._id, { email: newEmail }, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Email updated successfully', user });
  } catch (error) {
    console.error('Error updating user email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// **Delete User**
router.delete('/users/:userId', selfOnly, deleteAccount);
export default router;
