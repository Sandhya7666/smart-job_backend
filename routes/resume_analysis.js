// 15-06-2025 //latest
// const express = require("express");
// const multer = require("multer");
// const { PythonShell } = require("python-shell");
// const path = require("path");
// const fs = require("fs");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + "-" + file.originalname;
//     cb(null, uniqueName);
//   },
// });
// const upload = multer({ storage });

// const router = express.Router();

// POST /upload-resume
// router.post("/upload-resume", upload.single("resume"), async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//   const path = require("path");

//   const resumePath = path.join(__dirname, "../uploads", req.file.filename);
//   const safePath = resumePath.replace(/\\/g, "/");

//   const options = {
//     mode: "text",
//     pythonOptions: ["-u"],
//     scriptPath: "./python",
//     args: [safePath],
//   };

//   PythonShell.run("../analyze_resume.py", options, (err, results) => {
//     if (err) {
//       console.error("Python error:", err);
//       return res.status(500).json({ error: "Python script error" });
//     }

//     try {
//       const parsed = JSON.parse(results[0]);
//       return res.json(parsed);
//     } catch (parseErr) {
//       console.error("Parse error:", parseErr);
//       return res.status(500).json({ error: "Failed to parse Python response" });
//     }
//   });
// });

// router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });
//   const path = require("path");

//   const resumePath = path.join(__dirname, "../uploads", req.file.filename);
//   try {
//     const resumeText = fs.readFileSync(resumePath, "utf8");

//     const pyshell = new PythonShell("python/analyze_resume.py", {
//       mode: "json",
//       pythonOptions: ["-u"],
//     });

//     pyshell.send({ resume: resumeText });

//     let result = null;

//     pyshell.on("message", (message) => {
//       result = message;
//     });

//     pyshell.end((err) => {
//       if (err) return res.status(500).json({ error: "Python script failed" });

//       res.json(result);
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Error reading resume or processing" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { PythonShell } = require("python-shell");
const upload = require("../middleware/multer"); // Adjust path if needed
const pdfParse = require("pdf-parse");
const textract = require("textract");

// Allowed MIME types for resumes
const allowedTypes = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const mimeType = req.file.mimetype;
  if (!allowedTypes.includes(mimeType)) {
    return res.status(400).json({ error: "Only PDF or Word documents are allowed" });
  }

  const resumePath = path.join(__dirname, "../uploads", req.file.filename);

  try {
    let resumeText = "";

    if (mimeType === "application/pdf") {
      const buffer = fs.readFileSync(resumePath);
      const data = await pdfParse(buffer);
      resumeText = data.text;
    } else {
      // For Word documents (.doc, .docx)
      resumeText = await new Promise((resolve, reject) => {
        textract.fromFileWithPath(resumePath, (err, text) => {
          if (err) return reject(err);
          resolve(text);
        });
      });
    }

    const pyshell = new PythonShell("python/analyze_resume.py", {
      mode: "json",
      pythonOptions: ["-u"],
      encoding: "utf8",
    });

    pyshell.send({ resume: resumeText });

    let result = null;

    pyshell.on("message", (message) => {
      result = message;
    });

    pyshell.end((err) => {
      if (err) {
        console.error("Python Error:", err);
        return res.status(500).json({ error: "Python script failed" });
      }
      res.json(result);
    });
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    res.status(500).json({ error: "Error reading or processing resume" });
  }
});

router.post("/check-ats", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const resumePath = path.join(__dirname, "../uploads", req.file.filename);
  let resumeText = "";

  try {
    if (req.file.mimetype === "application/pdf") {
      const pdfData = fs.readFileSync(resumePath);
      const data = await pdfParse(pdfData);
      resumeText = data.text;
    } else if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const docBuffer = fs.readFileSync(resumePath);
      const result = await mammoth.extractRawText({ buffer: docBuffer });
      resumeText = result.value;
    }

    const pyshell = new PythonShell("python/ats_resume.py", {
      mode: "json",
      pythonOptions: ["-u"],
      encoding: "utf8",
    });

    pyshell.send({ resume: resumeText });

    let result = null;

    pyshell.on("message", (message) => {
      result = message;
    });

    pyshell.end((err) => {
      if (err) return res.status(500).json({ error: "Python script failed", details: err });
      res.json(result);
    });
  } catch (error) {
    res.status(500).json({ error: "Error reading or analyzing resume", details: error.message });
  }
});

module.exports = router;
