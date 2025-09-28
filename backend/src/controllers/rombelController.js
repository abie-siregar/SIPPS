const pool = require("../../config/database");

module.exports = {

  //mengambil seluruh rombel
  async getAll(req, res) {
  try {
    const result = await pool.query(
      `SELECT 
        r.*,
        t.tingkat_id_str,
        j.jurusan_id_str,
        p.nama
      FROM 
        rombel r
      LEFT JOIN
        tingkat t ON t.tingkat_id = r.tingkat_id
      LEFT JOIN
        jurusan j ON j.jurusan_id = r.jurusan_id
      LEFT JOIN
        ptk p ON p.ptk_id_dapodik = r.ptk_id_dapodik
      ORDER BY 
        rombel_id
      ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error Fetching rombel", error.message);
    res.status(500).json({error: "Internal Server Error"})
  }
  },

  //mengambil seluruh data rombel menggunakan filter
  async getFiltered(req, res) {
    try {
      const { tingkat_id, jurusan_id, search} = req.query;

      let query = 
      `SELECT 
        r.*,
        t.tingkat_id_str,
        j.jurusan_id_str,
        p.nama
      FROM 
        rombel r
      LEFT JOIN
        tingkat t ON t.tingkat_id = r.tingkat_id
      LEFT JOIN
        jurusan j ON j.jurusan_id = r.jurusan_id
      LEFT JOIN
        ptk p ON p.ptk_id_dapodik = r.ptk_id_dapodik
      WHERE 
        rombel_id
      ASC`;
      let params = [];
      let index = 1;

      if (tingkat_id) {
        query += ` AND tingkat_id = $${index}`;
        params.push(tingkat_id);
        index++;
      }

      if (jurusan_id) {
        query += ` AND jurusan_id = $${index}`;
        params.push(jurusan_id);
        index++;
      }

      if (search) {
        query += ` AND (nama ILIKE $${index} OR ptk_id_dapodik ILIKE $${index})`;
        params.push(`%${search}%`);
        index++;
      }

      query += " ORDER BY rombel_id ASC ";

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      res.json(result.rows[0]);
    }
    catch (error) {
      console.error("Gagal mengambil data rombel", error);
      res.status(500).json({error : "Internal Server Error" });
    }
  },

  //update untuk data rombel
  async update(req, res) {
    const { rombel_id } = req.params;
    const { nama, ptk_id_dapodik, tingkat_id, jurusan_id  } = req.body;

    if (isNaN(parseInt(rombel_id))) {
      return res.status(400).json({ error: "ID harus berupa angka" });
    }

    try {
      const query = `
        WITH updated AS (
          UPDATE 
            rombel 
          SET 
            nama = $1, 
            ptk_id_dapodik = $2, 
            tingkat_id = $3, 
            jurusan_id = $4
          WHERE rombel_id = $5
          RETURNING *)
        SELECT 
          u.rombel_id,
          u.nama,
          p.nama,
          t.tingkat_id_str,
          j.jurusan_id_str,
        FROM
          updated u
        LEFT JOIN
          ptk p ON p.ptk_id_dapodik = u.ptk_id_dapodik
          tingkat t ON t.tingkat_id = u.tingkat_id
          jurusan j ON j.jurusan_id = u.jurusan_id;

      `;
      const values = [nama, ptk_id_dapodik, tingkat_id, jurusan_id, rombel_id];

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
