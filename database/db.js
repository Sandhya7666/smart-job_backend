const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create or open the database
const db = new sqlite3.Database(path.resolve(__dirname, "auth.db"), (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
      )`,
      (err) => {
        if (err) console.log("Table creation error:", err);
      }
    );
  }
});

module.exports = db;
