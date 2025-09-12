const pool = require("../../config/database");

module.exports = {
  async getAll(req, res) {
    try {
      const result = await pool.query("SELECT * FROM siswa ORDER BY id ASC");
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching siswa:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
