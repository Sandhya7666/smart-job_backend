const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
require("dotenv").config();
const sendLoginEmail = require("../utils/index");
const { successResponse, errorResponse } = require("../middleware/response");
const { loginSchema } = require("../validators/auth");
const validate = require("../middleware/validate");

const router = express.Router();

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

    db.run(insertQuery, [first_name, last_name, email, hashed, type_of_user, mobile_no], async function (insertErr) {
      if (insertErr) {
        return errorResponse(res, "Failed to register user", 500, "auth_insert_error");
      }

      try {
        await sendLoginEmail(email, first_name || "User");
      } catch (e) {
        console.error("Failed to send email:", e.message);
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
router.post("/login", validate(loginSchema), (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM User_details WHERE email = ?`;

  db.get(query, [email], async (err, user) => {
    if (!user) {
      return errorResponse(res, "Invalid email or password. Please try again.", 400, "auth.unauthenticated");
    } else if (err) {
      return errorResponse(res, "Something went wrong", 500, "internal.error");
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        let data = {
          time: Date(),
          email: user.email,
        };
        const filteredUser = {
          user_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          type_of_user: user.type_of_user,
        };
        const token = jwt.sign(data, jwtSecretKey, { expiresIn: "1h" });

        return successResponse(res, { token: token, user_details: filteredUser }, "You are now logged in");
      } else {
        return res.status(400).json({ error: "Invalid email or password. Please try again." });
      }
    }
  });
});

router.post("/logout", (req, res) => {
  return successResponse(res, {}, "You have been logged out successfully");
});

//To get hashed password
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

//validateToken api
router.get("/validateToken", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ status: false, message: "Token not provided" });
  }

  try {
    const jwtSecretKey = process.env.JWT_SECRET_KEY || "key";
    const decoded = jwt.verify(token, jwtSecretKey);

    const userEmail = decoded.email;

    const query = `SELECT id,first_name,email,type_of_user FROM User_details WHERE email = ?`;
    db.get(query, [userEmail], (err, row) => {
      if (err) {
        return errorResponse(res, "Database error", 500, "internal.error");
      }
      if (!row) {
        return errorResponse(res, "User not found", 404, "resource_not_found");
      }
      const responseData = {
        token: token,
        user_details: row,
      };
      return successResponse(res, responseData, "Token is valid. User details fetched.");
    });
  } catch (err) {
    return errorResponse(res, "Invalid or expired token", 401, "auth.unauthenticated");
  }
});

module.exports = router;
