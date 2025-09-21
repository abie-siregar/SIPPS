const pool = require("../../config/database");

module.exports = {

  async getAll(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM rombel ORDER BY id_rombel ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error Fetching rombel", error.message);
    res.status(500).json({error: "Internal Server Error"})
  }
  },

  async getFiltered(req, res) {
    try {
      const { tingkat, jurusan, search} = req.query;

      let query = "SELECT * FROM rombel WHERE 1=1";
      let params = [];
      let index = 1;

      if (tingkat) {
        query += ` AND tingkat = $${index}`;
        params.push(tingkat);
        index++;
      }

      if (jurusan) {
        query += ` AND jurusan = $${index}`;
        params.push(jurusan);
        index++;
      }

      if (search) {
        query += ` AND (rombel ILIKE $${index} OR wali_kelas ILIKE $${index})`;
        params.push(`%${search}%`);
        index++;
      }

      query += " ORDER BY id_rombel ASC";

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      res.json(result.rows[0]);
    }
    catch (error) {
      console.error("Gagam mengambil data rombel", error);
      res.status(500).json({error : "Internal Server Error" });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { wali_kelas, rombel, tingkat, jmlh_l, jmlh_p, jurusan } = req.body;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: "ID harus berupa angka" });
    }

    try {
      const query = `
        UPDATE rombel 
        SET wali_kelas = $1, rombel = $2, tingkat = $3, jmlh_l = $4, jmlh_p = $5, jurusan = $6
        WHERE id = $7
        RETURNING *
      `;
      const values = [wali_kelas, rombel, tingkat, jmlh_l, p, jurusan, id];

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Data rombel tidak ditemukan" });
      }

      res.json({
        message: "Data rombel berhasil diperbarui",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Gagal memperbarui data rombel:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  
};
