import express from "express";
const router = express.Router();
import User from "../models/user.js"
import bcrypt from "bcrypt"
import mongoose from "mongoose"
router.get('/users', async (req, res) => {
        try {
          const users = await User.find();
          return res.status(200).json({ users });
        } catch (error) {
          console.error('Error getting events:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      ;
   
});


router.get('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Received userId:', userId); // Log the received userId

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    // Find the user by userId
    const user = await User.findById(userId); // Use findById to fetch the user by ObjectId
    console.log('User found:', user); // Log the user found

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ name: user.name });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// **Update User Credentials (Password Change)**

router.put('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    // Validate and hash new password
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Find the user by ObjectId and update the password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'User credentials updated successfully' });
  } catch (error) {
    console.error('Error updating user credentials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.put('/users/:userId/email', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const { newEmail } = req.body;

    // Validate new email
    if (!newEmail) {
      return res.status(400).json({ error: 'New email is required' });
    }
    // Find the user by ObjectId and update the email
    const user = await User.findByIdAndUpdate(userId, { email: newEmail }, { new: true });
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
router.delete('/users/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' }); // Informative message
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
export default router;