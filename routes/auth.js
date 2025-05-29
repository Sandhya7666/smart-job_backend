const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
require("dotenv").config();

const router = express.Router();

const { successResponse, errorResponse } = require("../middleware/response");

// Register endpoint
router.post("/register", async (req, res) => {
  const { first_name, last_name, email, password, type_of_user, mobile_no } = req.body;

  const checkQuery = `SELECT * FROM User_Details WHERE email = ?`;
  db.get(checkQuery, [email], async (err, user) => {
    if (err) {
      return errorResponse(res, "Something went wrong", 507, "internal.error");
    }

    if (user) {
      return errorResponse(res, "Email id is already used !", 400, "auth_duplicate");
    }

    const hashed = await bcrypt.hash(password, 10);
    const insertQuery = `INSERT INTO User_Details (first_name, last_name, email, password, type_of_user, mobile_no) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(insertQuery, [first_name, last_name, email, hashed, type_of_user, mobile_no], function (insertErr) {
      if (insertErr) {
        return errorResponse(res, "Failed to register user", 500, "auth_insert_error");
      }

      const newUserId = this.lastID;
      return successResponse(
        res,
        {
          user_id: newUserId,
        },
        "User registered successfully, login now to continue"
      );
    });
  });
});

// Login endpoint
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM User_details WHERE email = ?`;
  const resposeObj = {};

  db.get(query, [email], async (err, user) => {
    if (!user) {
      return errorResponse(res, "Invalid credentials", 400, "auth.unauthenticated");
    } else if (err) {
      return errorResponse(res, "Something went wrong", 500, "internal.error");
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        let data = {
          time: Date(),
          userId: 12,
        };

        const token = jwt.sign(data, jwtSecretKey);
        return successResponse(res, { token: token }, "You are now logged in");
      } else {
        return res.status(400).json({ error: "Invalid credentials" });
      }
    }
  });
  db.close();
});

router.post("/getHashedPassword", async (req, res) => {
  const { password } = req.body;

  if (password && password.length > 0) {
    try {
      const encryptedPassword = await bcrypt.hash(password, 10);
      return res.json({ encrypted_pwd: encryptedPassword });
    } catch {
      return res.status(500).json({ error: "Error hashing password" });
    }
  } else {
    res.json("Please give some input!");
  }
});

// Verification of JWT
router.get("/user/validateToken", (req, res) => {
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  console.log("🚀 ~ router.get ~ tokenHeaderKey:", tokenHeaderKey);
  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  console.log("🚀 ~ router.get ~ jwtSecretKey:", jwtSecretKey);

  try {
    const token = req.header(tokenHeaderKey);

    const verified = jwt.verify(token, jwtSecretKey);
    if (verified) {
      return res.send("Successfully Verified");
    } else {
      return res.status(401).send(error);
      //return errorResponse(res, "Something went wrong", 401, "auth.unauthenticated");
    }
  } catch (error) {
    return res.status(401).send(error);
  }
});

module.exports = router;
