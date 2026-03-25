import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Utility: Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Utility: Format user response (remove sensitive fields)
const formatUserResponse = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const register = async (req, res) => {
  const { name, email, password, picturePath } = req.body;
  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      picturePath,
      role: "farmer",
    });
    const savedUser = await newUser.save();

    const token = generateToken(savedUser._id);
    const formattedUser = formatUserResponse(savedUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: formattedUser,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const login = async (req, res) => {
  const email = req.body.values?.email || req.body.email;
  const password = req.body.values?.password || req.body.password;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);
    const formattedUser = formatUserResponse(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: formattedUser,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// Sync user with Clerk (for frontend auth integration)
export const syncUser = async (req, res) => {
  const { email, name } = req.body;

  try {
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email and name are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user synced from Clerk
      // Generate a random hash for Clerk-synced users (no password login)
      const salt = await bcrypt.genSalt(10);
      const randomHash = await bcrypt.hash(Math.random().toString(36), salt);

      const newUser = new User({
        email,
        name,
        password: randomHash, // Random hash prevents password login
        role: "farmer",
      });
      user = await newUser.save();
    }

    const token = generateToken(user._id);
    const formattedUser = formatUserResponse(user);

    res.status(200).json({
      success: true,
      message: "User synced successfully",
      user: formattedUser,
      token,
    });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({
      success: false,
      message: "Sync failed",
    });
  }
};
