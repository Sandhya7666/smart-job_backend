const express = require("express");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");
const db = require("../database/db");
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/upload-resume", upload.single("resume"), async (req, res) => {
  const userId = req.userid;
  const filePath = req.file.path;
  // const fileName = req.file.filename;
  const fileName = "demo.pdf";

  try {
    const existing = await db.get("SELECT id FROM resumes WHERE user_id = ?", [userId]);

    if (!existing) {
      const python = spawn("python", ["resume_analysis.py", filePath]);

      let output = "";
      python.stdout.on("data", (data) => {
        output += data.toString();
      });

      let errorOutput = "";
      python.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      python.on("close", async (code) => {
        if (code !== 0) {
          return res.status(500).json({ error: "Python script failed", errorOutput });
        }

        const resumeText = output.trim();

        await db.run(`INSERT INTO resumes (user_id, text, file_name, uploaded_at) VALUES (?, ?, ?, DATETIME('now'))`, [userId, resumeText, fileName]);

        res.json({ message: "Resume uploaded and processed successfully" });
      });
    } else {
      res.status(400).json({ error: "Resume already exists for this user." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
