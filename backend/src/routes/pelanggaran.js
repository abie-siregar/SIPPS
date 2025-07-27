const express = require("express");
const router = express.Router();
const pool = require("../database/connection");
const authencticateToken = require("../middleware/authMiddleware");

router.get("/", authencticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pelanggaran ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching pelanggaran : ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
