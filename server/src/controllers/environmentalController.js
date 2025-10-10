import { getEnvironmentalCorrelation } from "../services/environmentalservice.js"; 
import { asyncHandler } from "../utils/asyncHandler.js"; // Assuming you use this wrapper

/**
 * GET handler for /api/environmental-correlation
 * Fetches correlation data and returns JSON.
 */
export const fetchEnvironmentalCorrelation = asyncHandler(async (req, res) => {
  // If asyncHandler is used, it wraps the logic in a try/catch and passes errors 
  // to the global error middleware, which should return JSON.
  
  // Fetch data from the service
  const data = await getEnvironmentalCorrelation();
    
  // Success: Return JSON data
  return res.status(200).json({ 
      success: true, 
      data: data, 
      message: "Environmental correlation fetched successfully." 
  });
});
