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
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");

const cors = require("cors");

const app = express();
const corsOption = {
  origin: "*",
  methods: ["GET,POST,PUT,DELETE"],
  allowedHeaders: ["Content-Type,Authorization"],
};

// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server, {
//   cors: { origin: "*" },
// });

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("joinRoom", ({ userId }) => {
//     socket.join(userId);
//   });

//   socket.on("sendMessage", ({ senderId, receiverId, message }) => {
//     // Save message to DB here
//     io.to(receiverId).emit("receiveMessage", {
//       senderId,
//       message,
//       timestamp: new Date(),
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

// Routes
app.use(cors(corsOption));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/features", featuresRoutes);
app.use("/api/resume", resumeRoutes);
// app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
