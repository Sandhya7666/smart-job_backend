// routes/resumeRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { spawn } = require("child_process");
const authenticateJWT = require("../middleware/auth");

// POST /api/resume/analyze
// router.post("/analyze", authenticateJWT, async (req, res) => {
//   const userId = req.user.id;

//   try {
//     // Step 1: Fetch resume for the user
//     const resumeRow = await db.get(`SELECT text FROM resumes WHERE user_id = ?`, [userId]);

//     if (!resumeRow) {
//       return res.status(404).json({ success: false, message: "No resume found for this user." });
//     }

//     const resumeText = resumeRow.text;

//     // Step 2: Call Python script to analyze resume
//     const py = spawn("python3", ["C:\\Users\\sandh\\OneDrive\\Desktop\\Job\\resume_analysis.py"]);

//     let output = "";
//     let errorOutput = "";

//     py.stdout.on("data", (data) => {
//       output += data.toString();
//     });

//     py.stderr.on("data", (data) => {
//       errorOutput += data.toString();
//     });

//     py.on("close", (code) => {
//       if (code !== 0) {
//         console.error("Python Error:", errorOutput);
//         return res.status(500).json({ success: false, message: "Error analyzing resume." });
//       }

//       try {
//         const result = JSON.parse(output);
//         return res.json({ success: true, analysis: result });
//       } catch (e) {
//         return res.status(500).json({ success: false, message: "Invalid response from analyzer." });
//       }
//     });

//     py.stdin.write(JSON.stringify({ resume: resumeText }));
//     py.stdin.end();
//   } catch (err) {
//     console.error("Error in resume analysis route:", err);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });

router.post("/analyze", (req, res) => {
  const userId = req;

  try {

    const resumeRow = db.get(`SELECT text FROM resumes WHERE user_id = ?`, [userId]);

    if (!resumeRow) {
      return res.status(404).json({ success: false, message: "No resume found for this user." });
    }

    const resumeText = resumeRow.text;

    
    const py = spawn("python", ["C:\\Users\\sandh\\OneDrive\\Desktop\\Pythone_backend\\resume_analysis.py"]);

    let output = "";
    let errorOutput = "";

    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    py.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    py.on("close", (code) => {
      if (code !== 0) {
        console.error("Python Error:", errorOutput);
        return res.status(500).json({ success: false, message: "Error analyzing resume." });
      }

      try {
        const result = JSON.parse(output);
        return res.json({ success: true, analysis: result });
      } catch (e) {
        return res.status(500).json({ success: false, message: "Invalid response from analyzer." });
      }
    });

    py.stdin.write(JSON.stringify({ resume: resumeText }));
    py.stdin.end();
  } catch (err) {
    console.error("Error in resume analysis route:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
