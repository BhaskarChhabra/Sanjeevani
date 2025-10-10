import express from "express";
import axios from "axios";

const router = express.Router();

// Hardcoded user ID for testing
const TEST_USER_ID = "68dc1f90ed63b50126fd01f9";

// Train model
router.post("/train-model", async (req, res) => {
  try {
    const { pill_name } = req.body;
    const response = await axios.post("http://127.0.0.1:5020/api/v1/reminder-ai/train-model", {
      user_id: TEST_USER_ID,
      pill_name,
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error calling Flask /train-model:", error.message);
    res.status(500).json({ error: "Failed to train model" });
  }
});

// Predict
router.post("/predict", async (req, res) => {
  try {
    const { pill_name, scheduled_time } = req.body;
    const response = await axios.post("http://127.0.0.1:5020/api/v1/reminder-ai/predict", {
      user_id: TEST_USER_ID,
      pill_name,
      scheduled_time,
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error calling Flask /predict:", error.message);
    res.status(500).json({ error: "Failed to get prediction" });
  }
});

export default router;
