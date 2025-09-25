const pool = require("../../config/database");

module.exports = {
  async getAll(req, res) {
    try {
      const result = await pool.query("SELECT * FROM siswa ORDER BY siswa_id ASC");
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching siswa:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getFiltered(req, res) {
    try {
      const { nisn, rombel, search} = req.query;

      let query = "SELECT * FROM siswa WHERE 1=1";
      let params = [];
      let index = 1;

      if (nisn) {
        query += ` AND nisn = $${index}`;
        params.push(nisn);
        index++;
      }

      if (rombel) {
        query += ` AND rombel_id_dapodik = $${index}`;
        params.push(rombel);
        index++;
      }

      if (search) {
        query += ` AND (nama ILIKE $${index}`;
        params.push(`%${search}%`);
        index++;
      }

      query += " ORDER BY siswa_id ASC";

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Data siswa tidak ditemukan" });
      }

      res.json(result.rows[0]);
    }
    catch (error) {
      console.error("Gagal mengambil data siswa", error);
      res.status(500).json({error : "Internal Server Error" });
    }
  },

  async getById(req, res) {
    const { siswa_id } = req.params;

    if (isNaN(siswa_id)) {
      return res.status(400).json({ error: "ID harus berupa angka" });
    }

    try {
      const result = await pool.query(
        "SELECT * FROM siswa WHERE siswa_id = $1",
        [siswa_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Data siswa tidak ditemukan" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching siswa by ID:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

};
