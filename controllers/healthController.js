import { asyncHandler } from "../middlewares/errorHandler.js";

export const analyzePlantHealth = asyncHandler(async (req, res) => {
  const { imageUrl, plantType } = req.body;
  
  if (!imageUrl) {
    return res.status(400).json({
      success: false,
      message: "Image URL is required",
    });
  }

  // Placeholder for ML model integration
  const analysis = {
    plantType: plantType || "unknown",
    healthScore: 85,
    diseases: [],
    recommendations: [
      "Ensure adequate watering",
      "Check soil pH levels",
      "Provide sufficient sunlight",
    ],
    confidence: 0.92,
  };

  res.status(200).json({
    success: true,
    message: "Plant analysis completed",
    data: analysis,
  });
});

export const getPlantInfo = asyncHandler(async (req, res) => {
  const { plantType } = req.params;

  if (!plantType) {
    return res.status(400).json({
      success: false,
      message: "Plant type is required",
    });
  }

  // Placeholder plant database
  const plantDatabase = {
    tomato: {
      name: "Tomato",
      wateringNeeds: "Regular - keep soil moist",
      sunlight: "6-8 hours daily",
      temperature: "21-27°C",
      harvestTime: "60-85 days",
      commonDiseases: ["Blight", "Powdery Mildew"],
    },
  };

  const info = plantDatabase[plantType.toLowerCase()] || {
    name: plantType,
    note: "Plant database entry for this species is not available",
  };

  res.status(200).json({
    success: true,
    message: "Plant information retrieved",
    data: info,
  });
});
