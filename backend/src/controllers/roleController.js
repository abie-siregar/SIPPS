const pool = require("../../config/database");

module.exports = {
  async getAll(req, res) {
    try {
      const result = await pool.query(
        `SELECT
            *   
        FROM 
            roles
        ORDER BY 
            nama_role 
        ASC`,
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: "Gagal mengambil data role" });
    }
  },
};
