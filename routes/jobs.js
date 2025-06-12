const express = require("express");
const db = require("../database/db");
const router = express.Router();
require("dotenv").config();
const { spawn } = require("child_process");
const authenticateToken = require("../middleware/auth");
const validate = require("../middleware/validate");
const { postJobSchema } = require("../validators/jobs");

const { successResponse, errorResponse } = require("../middleware/response");

router.post("/get_all_jobs", (req, res) => {
  const { search, filter } = req.body;

  const query = `SELECT * FROM jobs`;

  db.all(query, (err, rows) => {
    if (err) {
      errorResponse(res, "Something went wrong", 500, "internal.error");
    } else {
      successResponse(res, rows, "You are now logged in");
    }
  });
  db.close();
});

// router.post("/api/skills/analyze", upload.single("resume"), (req, res) => {
//   const python = spawn("python3", ["./python/analyze_resume.py", req.file.path]);

//   let output = "";
//   python.stdout.on("data", (data) => {
//     output += data.toString();
//   });

//   python.on("close", () => {
//     res.json(JSON.parse(output));
//   });
// });

router.post("/filter", (req, res) => {
  const { job_type, location, tags, title } = req.body;

  let query = `SELECT * FROM Jobs Posted_Jobs`;
  // const params = [];

  // if (job_type) {
  //   query += ` AND job_type = ?`;
  //   params.push(job_type);
  // }

  // if (location) {
  //   query += ` AND location LIKE ?`;
  //   params.push(`%${location}%`);
  // }

  // if (tags) {
  //   query += ` AND tags LIKE ?`;
  //   params.push(`%${tags}%`);
  // }

  // if (title) {
  //   query += ` AND title LIKE ?`;
  //   params.push(`%${title}%`);
  // }

  // query += ` ORDER BY posted_at DESC`;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    return res.status(200).json({
      success: true,
      total: rows.length,
      jobs: rows,
    });
  });
});

// POST /add-job (protected)
// router.post("/add-job", authenticateToken, async (req, res) => {

// });

// router.post("/add-job", async (req, res) => {
//   try {
//     const recruiter_id = req.user.id; // From JWT middleware

//     const { job_title, company_name, job_description, skills_required, employment_type, work_mode, location, salary_range, experience_level, education_required, number_of_openings, application_deadline, tags, visibility_status, is_active, jd_pdf_path } = req.body;

//     const created_at = new Date().toISOString();
//     const updated_at = created_at;

//     const query = `
//       INSERT INTO jobs (
//         recruiter_id,
//         job_title,
//         company_name,
//         job_description,
//         skills_required,
//         employment_type,
//         work_mode,
//         location,
//         salary_range,
//         experience_level,
//         education_required,
//         number_of_openings,
//         application_deadline,
//         created_at,
//         updated_at,
//         tags,
//         visibility_status,
//         is_active,
//         jd_pdf_path
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const values = [recruiter_id, job_title, company_name, job_description, skills_required, employment_type, work_mode, location, salary_range, experience_level, education_required, number_of_openings, application_deadline, created_at, updated_at, tags, visibility_status, is_active, jd_pdf_path];

//     db.run(query, values, function (err) {
//       if (err) {
//         console.error("Insert error:", err.message);
//         return res.status(500).json({ status: false, message: "Database error" });
//       }
//       res.status(201).json({ status: true, message: "Job posted successfully", job_id: this.lastID });
//     });
//   } catch (error) {
//     console.error("Server error:", error.message);
//     res.status(500).json({ status: false, message: "Server error" });
//   }
// });

router.post("/post-job", validate(postJobSchema), async (req, res) => {
  try {
    const { recruiter_id, job_title, company_name, job_description, skills_required, employment_type, work_mode, location, salary_range, experience_level, education_required, number_of_openings, application_deadline, tags, visibility_status, is_active, jd_pdf_path } = req.body;

    const created_at = new Date().toISOString();
    const updated_at = created_at;

    const query = `
      INSERT INTO jobs (
        recruiter_id,
        job_title,
        company_name,
        job_description,
        skills_required,
        employment_type,
        work_mode,
        location,
        salary_range,
        experience_level,
        education_required,
        number_of_openings,
        application_deadline,
        created_at,
        updated_at,
        tags,
        visibility_status,
        is_active,
        jd_pdf_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [recruiter_id, job_title, company_name, job_description, skills_required, employment_type, work_mode, location, salary_range, experience_level, education_required, number_of_openings, application_deadline, created_at, updated_at, tags, visibility_status, is_active, jd_pdf_path];

    db.run(query, values, function (err) {
      if (err) {
        return errorResponse(res, "Failed to post a job", 500, "auth_insert_error");
      }
      return successResponse(res, { token: token, user_details: filteredUser }, "Job posted successfully");
    });
  } catch (error) {
    return errorResponse(res, "Something went wrong", 500, "internal.error");
  }
});

module.exports = router;
