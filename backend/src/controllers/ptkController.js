const pool = require("../../config/database");

module.exports = {
  async getAll(req, res) {
    try {
      const result = await pool.query(
        "SELECT nama, nuptk, jenis_ptk, tugas_tambahan, hp, email FROM ptk ORDER BY id ASC"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching ptk:", error.message);
      res.status(500).json({ error: "Internall Server Error" });
    }
  },
};
