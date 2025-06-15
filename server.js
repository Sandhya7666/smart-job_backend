require("dotenv").config();
const http = require("http");
const express = require("express");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const jobsRoutes = require("./routes/jobs");
const skillsRoutes = require("./routes/skiils");
const mettingRoutes = require("./routes/metting");
const featuresRoutes = require("./routes/features_new");
const resumeRoutes = require("./routes/upload");
const forgotPasswordRoutes = require("./routes/forgotPassword");
const resumeanalysisRoutes = require("./routes/resume_analysis");
const bodyParser = require("body-parser");

const cors = require("cors");

const app = express();
const corsOption = {
  origin: "*",
  methods: ["GET,POST,PUT,DELETE"],
  allowedHeaders: ["Content-Type,Authorization"],
};

// Routes
app.use(cors(corsOption));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/features", featuresRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/forgotPassword", forgotPasswordRoutes);
app.use("/api/resume_analysis", resumeanalysisRoutes);
// app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
