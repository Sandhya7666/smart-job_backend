// routes/checkJobFake.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/check-fake", async (req, res) => {
  const { title, description } = req.body;

  try {
    const response = await axios.post("http://localhost:5000/predict-fake-job", {
      title,
      description,
    });

    res.json(response.data);
  } catch (err) {
    console.error("Prediction failed:", err);
    res.status(500).send("Failed to predict job authenticity");
  }
});

module.exports = router;
