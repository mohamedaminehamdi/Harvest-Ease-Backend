import jwt from "jsonwebtoken";

// Verifies the Bearer token issued by /auth/login and sets req.user
export const requireAuth = (req, res, next) => {
  const [scheme, token] = (req.header("Authorization") || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    req.user = { _id };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
