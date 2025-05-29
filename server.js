const express = require("express");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const jobsRoutes = require("./routes/jobs");
const cors = require("cors");

const app = express();
const corsOption = {
  origin: ["http://localhost:5173", "http://localhost:5000"],
  methods: ["GET,POST,PUT,DELETE"],
  allowedHeaders: ["Content-Type,Authorization"],
};

// Routes
app.use(cors(corsOption));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
