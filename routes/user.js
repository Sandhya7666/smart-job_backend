const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Example endpoint: GET /api/user/profile/:id
router.get('/profile/:id', (req, res) => {
  const userId = req.params.id;
  const query = `SELECT first_name, last_name, email, type_of_user FROM Users_detail WHERE id = ?`;

  db.get(query, [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Something went wrong" });
    }
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: row });
  });
});

module.exports = router;
