const express = require("express");
const db = require("../database/db");
const router = express.Router();
require("dotenv").config();

const { successResponse, errorResponse } = require("../middleware/response");

router.post("/get_all_jobs", (req, res) => {
  const { search, filter } = req.body;
  console.log("🚀 ~ router.post ~ search:", search);
  console.log("🚀 ~ router.post ~ filter:", filter);
  const query = `SELECT * FROM jobs`;


  db.all(query, (err, rows) => {
    console.log("🚀 ~ db.all ~ rows:", typeof rows);
    // res.json("i am here");
    if (err) {
      errorResponse(res, "Something went wrong", 500, "internal.error");
    } else {
      successResponse(res, rows, "You are now logged in");
    }
  });
  db.close();
});

module.exports = router;
    
