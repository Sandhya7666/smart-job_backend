const express = require("express");
const router = express.Router();
const db = require("../database/db");
const nodemailer = require("nodemailer");
const { successResponse, errorResponse } = require("../middleware/response");

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

router.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  const checkQuery = `SELECT * FROM User_Details WHERE email = ?`;

  console.log("🚀 ~ router.post ~ checkQuery:", checkQuery);
  db.get(checkQuery, [email], async (err, user) => {
    if (err) {
      return errorResponse(res, "Something went wrong", 507, "internal.error");
    }

    if (!user) {
      return errorResponse(res, "Email ID not found", 404, "auth_email_not_found");
    }

    try {
      const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
      otpStore.set(email, otp);

      // Send OTP email
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Your OTP for Password Reset",
        text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
      });

      res.json({ message: "OTP sent to email successfully." });

      setTimeout(() => otpStore.delete(email), 10 * 60 * 1000);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const storedOtp = otpStore.get(email);
  if (!storedOtp) {
    return res.status(400).json({ error: "OTP expired or not found" });
  }

  if (parseInt(otp) === storedOtp) {
    otpStore.delete(email); // Remove after successful verification
    res.json({ message: "OTP verified successfully" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  const hashedPassword = require("bcrypt").hashSync(newPassword, 10);

  try {
    await db.run("UPDATE User_Details SET password = ? WHERE email = ?", [hashedPassword, email]);
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
