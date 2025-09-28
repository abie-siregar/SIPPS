const pool = require("../../config/database");

module.exports = {
  //mengambil seluruh data siswa
  async getAll(req, res) {
    try {
      const result = await pool.query(
        `SELECT 
          s.*,
          a.agama_id_str,
          smt.semester_id_str,
          r.nama
        FROM 
          siswa s
        LEFT JOIN
          agama a ON s.agama_id = s.agama_id
        LEFT JOIN
          semester smt ON s.semester_id = s.semester_id
        LEFT JOIN
          rombel r ON s.rombel_id_dapodik = s.rombel_id_dapodik
        ORDER BY 
          siswa_id
        ASC`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching siswa:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //mengambil seluruh data siswa menggunakan filter
  async getFiltered(req, res) {
    try {
      const { nisn, rombel, search} = req.query;

      let query = `
        SELECT 
          s.*,
          a.agama_id_str,
          smt.semester_id_str,
          r.nama
        FROM 
          siswa s
        LEFT JOIN
          agama a ON s.agama_id = s.agama_id
        LEFT JOIN
          semester smt ON s.semester_id = s.semester_id
        LEFT JOIN
          rombel r ON s.rombel_id_dapodik = s.rombel_id_dapodik
        WHERE 
          siswa_id 1=1
        `;
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

  //mengambil seluruh data siswa menggunakan id
  async getById(req, res) {
    const { siswa_id } = req.params;

    if (isNaN(siswa_id)) {
      return res.status(400).json({ error: "ID harus berupa angka" });
    }

    try {
      const result = await pool.query(
        `
        SELECT 
          s.*,
          a.agama_id_str,
          smt.semester_id_str,
          r.nama
        FROM 
          siswa s
        LEFT JOIN
          agama a ON s.agama_id = s.agama_id
        LEFT JOIN
          semester smt ON s.semester_id = s.semester_id
        LEFT JOIN
          rombel r ON s.rombel_id_dapodik = s.rombel_id_dapodik
        WHERE 
          siswa_id = $1`,
        [siswa_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Data siswa tidak ditemukan" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching siswa by Id:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

};
