const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/auth");
const db = require("../database/db");

router.use(authenticateJWT);

// Send message
router.post("/", async (req, res) => {
  const senderId = req.user.id;
  const { receiverId, message } = req.body;

  if (!receiverId || !message) return res.status(400).json({ error: "Missing fields" });

  await db.run(`INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)`, [senderId, receiverId, message]);
  res.sendStatus(201);
});

// Get chat history with another user
router.get("/:userId", async (req, res) => {
  const userId = req.user.id;
  const otherId = req.params.userId;

  const messages = await db.all(
    `SELECT * FROM messages
     WHERE (sender_id = ? AND receiver_id = ?)
        OR (sender_id = ? AND receiver_id = ?)
     ORDER BY timestamp`,
    [userId, otherId, otherId, userId]
  );

  res.json(messages);
});

module.exports = router;
