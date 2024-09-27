import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
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

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  // Uploaded files get a generated name, so point picturePath at it
  const picturePath = req.file ? req.file.filename : req.body.picturePath;
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
    // errorHandler turns validation errors into 400 and duplicate emails into 409
    next(error);
  }
};

export const login = async (req, res, next) => {
  const email = req.body.values?.email || req.body.email;
  const password = req.body.values?.password || req.body.password;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // password is select:false on the schema, so ask for it explicitly
    const user = await User.findOne({ email }).select("+password");
    // Same response for unknown email and wrong password (no user enumeration)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
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
    next(error);
  }
};

// Look up the Clerk user behind a verified session so the email comes from Clerk, not the request body
const fetchClerkUser = async (clerkUserId) => {
  const response = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(clerkUserId)}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });
  if (!response.ok) throw new Error(`Clerk API responded ${response.status}`);
  return response.json();
};

// Exchange a Clerk session token for a backend token, creating the user on first sign-in
export const syncUser = async (req, res) => {
  const { CLERK_JWT_KEY, CLERK_SECRET_KEY } = process.env;
  if (!CLERK_JWT_KEY || !CLERK_SECRET_KEY) {
    return res.status(503).json({ success: false, message: "Clerk sign-in is not configured" });
  }

  const [scheme, clerkToken] = (req.header("Authorization") || "").split(" ");
  let claims;
  try {
    if (scheme !== "Bearer" || !clerkToken) throw new Error("missing token");
    // .env files often store the PEM on one line with literal \n
    claims = jwt.verify(clerkToken, CLERK_JWT_KEY.replace(/\\n/g, "\n"), { algorithms: ["RS256"] });
  } catch {
    return res.status(401).json({ success: false, message: "Invalid Clerk session" });
  }

  // Clerk recommends rejecting sessions issued for other frontends
  const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
  if (claims.azp && claims.azp !== allowedOrigin) {
    return res.status(401).json({ success: false, message: "Invalid Clerk session" });
  }

  try {
    const clerkUser = await fetchClerkUser(claims.sub);
    const primary = clerkUser.email_addresses?.find((e) => e.id === clerkUser.primary_email_address_id);
    if (primary?.verification?.status !== "verified") {
      return res.status(403).json({ success: false, message: "Verify your email address first" });
    }
    const email = primary.email_address.toLowerCase();

    let user = await User.findOne({ email });
    if (!user) {
      const clerkName = [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(" ");
      const name = [req.body.name, clerkName].find((n) => typeof n === "string" && n.trim().length >= 2) || "Farmer";
      user = await new User({
        name: name.trim().slice(0, 50),
        email,
        // Unguessable password: Clerk users sign in through Clerk, not /auth/login
        password: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
        role: "farmer",
      }).save();
    }

    res.status(200).json({
      success: true,
      message: "User synced successfully",
      user: formatUserResponse(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(502).json({ success: false, message: "Sync failed" });
  }
};
