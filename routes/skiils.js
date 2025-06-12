const { spawn } = require("child_process");

const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "uploads/" });
const authenticateJWT = require("../middleware/auth");

router.post("/analyze", upload.single("resume"), (req, res) => {
  const pythonScriptPath = "C:\\Users\\sandh\\OneDrive\\Desktop\\Scraper\\main.py";
  const python = spawn("python", [pythonScriptPath, req.file.path]);

  let output = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error(`Python error: ${data}`);
  });

  python.on("close", (code) => {
    try {
      res.json(JSON.parse(output));
    } catch (err) {
      res.status(500).json({ error: "Failed to parse Python output" });
    }
  });
});

function getCompatibilityScore(resumeText, jobDescription) {
  return new Promise((resolve, reject) => {
    const py = spawn("python3", ["C:\\Users\\sandh\\OneDrive\\Desktop\\Job\\index.py"]);
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
        return reject(new Error(`Python exited with code ${code}: ${errorOutput}`));
      }
      const score = parseFloat(output.trim());
      if (isNaN(score)) {
        return reject(new Error(`Invalid score from Python: "${output}"`));
      }
      resolve(score);
    });

    // Write JSON payload into Python's stdin
    const payload = { resume: resumeText, job: jobDescription };
    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
  });
}

// Protect this route with JWT authentication
// router.get("/:jobId", authenticateJWT, async (req, res) => {
//   const userId = req.user.id;
//   const jobId = req.params.jobId;

//   try {
//     // 1. Fetch the user's resume text
//     const resumeRow = await db.get(
//       `SELECT text
//          FROM resumes
//         WHERE user_id = ?`,
//       [userId]
//     );

//     if (!resumeRow) {
//       return res.status(404).json({ error: "Resume not found for this user." });
//     }
//     const resumeText = resumeRow.text;

//     // 2. Fetch the job description text
//     const jobRow = await db.get(
//       `SELECT description
//          FROM jobs
//         WHERE id = ?`,
//       [jobId]
//     );

//     if (!jobRow) {
//       return res.status(404).json({ error: "Job not found." });
//     }
//     const jobDescription = jobRow.description;

//     // 3. Compute compatibility score via Python script
//     const score = await getCompatibilityScore(resumeText, jobDescription);

//     // 4. Return JSON response
//     return res.json({ score });
//   } catch (err) {
//     console.error("Error in /api/match-score:", err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.post("/analyze", authenticateJWT, async (req, res) => {
  const userId = req.user.id;

  try {
    // Step 1: Fetch resume for the user
    const resumeRow = await db.get(`SELECT text FROM resumes WHERE user_id = ?`, [userId]);

    if (!resumeRow) {
      return res.status(404).json({ success: false, message: "No resume found for this user." });
    }

    const resumeText = resumeRow.text;

    // Step 2: Call Python script to analyze resume
    const py = spawn("python3", ["C:\\Users\\sandh\\OneDrive\\Desktop\\Job\\resume_analysis.py"]);

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
