import User from "../models/user.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.params.userId;
  const updates = req.body;

  // Allowed fields
  const allowedFields = ["name", "farmName", "location", "phone", "bio", "website", "picturePath"];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (field in updates) {
      updateData[field] = updates[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const formattedUser = user.toObject();
  delete formattedUser.password;

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: formattedUser,
  });
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.params.userId;

  const user = await User.findById(userId).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile retrieved",
    user: user.toObject(),
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Old and new passwords are required",
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const bcrypt = require("bcryptjs");
  const validPassword = await bcrypt.compare(oldPassword, user.password);

  if (!validPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
