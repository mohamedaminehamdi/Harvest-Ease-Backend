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

  /*
// Update user by ID
router.put('/users/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const eventDataToUpdate = req.body;
    
        const updatedUser = await User.findOneAndUpdate({ userId }, userDataToUpdate, { new: true });
    
        if (!updatedUser) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        return res.status(200).json({ message: 'user updated successfully', user: updatedUser});
      } catch (error) {
        console.error('Error updating user by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
});
*/




export default router;