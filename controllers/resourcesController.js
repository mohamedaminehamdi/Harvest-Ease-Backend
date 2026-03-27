import ResourceUsage from "../models/resourceUsage.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

export const addResourceUsage = asyncHandler(async (req, res) => {
  const { resourceName, quantity, unit, cost, action, notes } = req.body;
  const userId = req.user._id || req.body.userId;

  let errors = [];
  if (!resourceName || !["water", "fertilizer", "pesticide", "seed", "equipment", "labor"].includes(resourceName)) {
    errors.push("Valid resource name required");
  }
  if (!quantity || quantity < 0) errors.push("Valid quantity required");
  if (!unit || !["liters", "kg", "units", "hours"].includes(unit)) errors.push("Valid unit required");
  if (cost === undefined || cost < 0) errors.push("Valid cost required");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  const resourceUsage = new ResourceUsage({
    userId,
    resourceName,
    quantity,
    unit,
    cost,
    action: action || "usage",
    notes,
  });

  const saved = await resourceUsage.save();
  res.status(201).json({
    success: true,
    message: "Resource usage recorded",
    data: saved,
  });
});

export const getResourceUsage = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.query.userId;
  const { startDate, endDate, resourceName } = req.query;

  let query = { userId };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (resourceName) query.resourceName = resourceName;

  const usage = await ResourceUsage.find(query).sort({ date: -1 });
  const totalCost = usage.reduce((sum, item) => sum + item.cost, 0);

  res.status(200).json({
    success: true,
    message: "Resource usage retrieved",
    data: usage,
    summary: { totalCost, count: usage.length },
  });
});

export const updateResourceUsage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = req.user._id || req.body.userId;

  // Validate provided fields
  if (updates.resourceName && !["water", "fertilizer", "pesticide", "seed", "equipment", "labor"].includes(updates.resourceName)) {
    return res.status(400).json({ success: false, message: "Invalid resource name" });
  }
  if (updates.unit && !["liters", "kg", "units", "hours"].includes(updates.unit)) {
    return res.status(400).json({ success: false, message: "Invalid unit" });
  }
  if (updates.quantity !== undefined && updates.quantity < 0) {
    return res.status(400).json({ success: false, message: "Quantity cannot be negative" });
  }
  if (updates.cost !== undefined && updates.cost < 0) {
    return res.status(400).json({ success: false, message: "Cost cannot be negative" });
  }

  const usage = await ResourceUsage.findById(id);

  if (!usage) {
    return res.status(404).json({ success: false, message: "Resource usage not found" });
  }

  // Verify user owns the resource usage record
  if (usage.userId.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized to update this record" });
  }

  const updatedUsage = await ResourceUsage.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Resource usage updated",
    data: updatedUsage,
  });
});

export const deleteResourceUsage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id || req.body.userId;

  const usage = await ResourceUsage.findById(id);

  if (!usage) {
    return res.status(404).json({ success: false, message: "Resource usage not found" });
  }

  // Verify user owns the resource usage record
  if (usage.userId.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized to delete this record" });
  }

  await ResourceUsage.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Resource usage deleted",
  });
});
