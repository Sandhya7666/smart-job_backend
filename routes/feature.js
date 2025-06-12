// // routes/resumeRoutes.js
// const express = require("express");
// const router = express.Router();
// const db = require("../db");
// const { spawn } = require("child_process");
// const authenticateJWT = require("../middleware/auth");

// router.post("/analyze", authenticateJWT, async (req, res) => {
//   const userId = req.user.id;

//   try {
//     const resumeRow = await db.get(`SELECT text FROM resumes WHERE user_id = ?`, [userId]);

//     if (!resumeRow) {
//       return res.status(404).json({ success: false, message: "No resume found for this user." });
//     }

//     const resumeText = resumeRow.text;

//     // Step 2: Call Python script to analyze resume
//     const py = spawn("python3", ["C:UserssandhOneDriveDesktopPythone_backend\\resume_analysis.py"]);

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

// module.exports = router;

// const express = require("express");
// const router = express.Router();

// const OpenAI = require("openai");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// console.log("🚀 ~ openai:", openai);

// const fakeUserResume = {
//   userId: 1,
//   resumeText: `John Doe is a recent computer science graduate who worked on several university-level projects including a web application for tracking attendance.`,
// };

// // POST /api/analyze-resume
// router.post("/analyze-resume", async (req, res) => {
//   const { userId } = req.body;
//   // if (!userId || userId !== 1) {
//   //   return res.status(401).json({ error: "Unauthorized user" });
//   // }

//   const resume = fakeUserResume.resumeText;

//   const prompt = `
// You are a resume consultant. Analyze the resume below.  

// Resume:
// """
// ${resume}
// """

// Respond with a JSON containing:
// - summary
// - strength (Good, Moderate, Poor)
// - spelling_issues (list)
// - common_issues (list)
// - suggestions (list)
// `;

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: prompt }],
//     });
//     console.log("🚀 ~ router.post ~ response:", response)

//     let result;
//     try {
//       result = JSON.parse(response.data.choices[0].message.content);
//     } catch {
//       return res.status(500).json({ error: "Failed to parse AI response", raw: response.data.choices[0].message.content });
//     }

//     return res.json({ success: true, analysis: result });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "OpenAI API error" });
//   }
// });

// module.exports = router;
