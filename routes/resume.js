


router.post("/upload-resume", upload.single("resume"), async (req, res) => {
  const userId = req.user.id; // assuming you use JWT auth middleware
  const filePath = req.file.path;
  const fileName = req.file.filename;

  try {
    // Check if resume already exists
    const existing = await db.get("SELECT id FROM resumes WHERE user_id = ?", [userId]);

    if (!existing) {
      // Call Python to extract text
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

        // Insert into DB
        await db.run(
          `INSERT INTO resumes (user_id, text, file_name, uploaded_at) VALUES (?, ?, ?, DATETIME('now'))`,
          [userId, resumeText, fileName]
        );

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
