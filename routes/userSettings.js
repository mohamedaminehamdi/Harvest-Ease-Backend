import express from "express";
const router = express.Router();
import User from "../models/user.js"
// Create a new user   
router.post('/new', async (req, res) => {
    const { userId,userFirstName, userLastName, userAge  } = req.body;
    try {
        const newUser = new User({ userId,userFirstName, userLastName, userAge  });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
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
      const userId = parseInt(req.params.userId);
      console.log('Received userId:', userId); // Log the received userId
      // Validate userId
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid userId' });
      }
      const user = await User.findOne({ userId: userId }); // Use userId instead of id
      console.log('User found:', user); // Log the user found
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
// **Update User Credentials (Password Change)**
router.put('/users/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    // Validate and hash new password (implementation omitted for brevity)
    const { newPassword } = req.body;
    // ... (code to validate and hash newPassword)

    const updatedUser = await User.findOneAndUpdate(
      { userId: userId },
      { password: hashedPassword }, // Replace with hashed password
      { new: true } // Return the updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User credentials updated successfully' }); // Informative message
  } catch (error) {
    console.error('Error updating user credentials:', error);
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