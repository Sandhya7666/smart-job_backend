require("dotenv").config();
const nodemailer = require("nodemailer");

const sendLoginEmail = async (toEmail, userName) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: `"Smart Job Portal" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Login Successful!",
    html: `<h3>Hello ${userName},</h3><p>You have successfully logged in to Smart Job Portal.</p>`,
  });

  console.log("Email sent: %s", info.messageId);
};

module.exports = sendLoginEmail;
