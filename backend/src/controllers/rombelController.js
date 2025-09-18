const pool = require("../../config/database");

module.exports = {
  // async getList(req, res) {
  //   const { tingkat, jurusan, search } = req.body;

  //   try {
  //     let query = "SELECT * FROM rombel WHERE 1=1";
  //     const values = [];

  //     if (tingkat && Array.isArray(tingkat) && tingkat.length > 0) {
  //       const placeholders = tingkat
  //         .map((_, i) => `$${values.length + i + 1}`)
  //         .join(", ");
  //       query += ` AND tingkat IN (${placeholders})`;
  //       values.push(...tingkat);
  //     }

  //     if (jurusan && Array.isArray(jurusan) && jurusan.length > 0) {
  //       const placeholders = jurusan
  //         .map((_, i) => `$${values.length + i + 1}`)
  //         .join(", ");
  //       query += ` AND jurusan IN (${placeholders})`;
  //       values.push(...jurusan);
  //     }

  //     if (search) {
  //       values.push(`%${search.toLowerCase()}%`);
  //       query += ` AND LOWER(wali_kelas) LIKE $${values.length}`;
  //     }

  //     query += " ORDER BY id_rombel ASC";

  //     const result = await pool.query(query, values);
  //     res.json({
  //       total: result.rowCount,
  //       data: result.rows,
  //     });
  //   } catch (error) {
  //     console.error("Gagal mengambil data rombel:", error);
  //     res.status(500).json({ error: "Internal Server Error" });
  //   }
  // },

  async getById(req, res) {
    const { id } = req.params;
    const idNumber = parseInt(id, 10);

    if (isNaN(idNumber)) {
      return res.status(400).json({ error: "ID harus berupa angka" });
    }

    try {
      const result = await pool.query("SELECT * FROM rombel WHERE id = $1", [
        idNumber,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Data tidak ditemukan" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Gagal mengambil data rombel:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { wali_kelas, rombel, tingkat, l, p, jurusan } = req.body;

    // Validasi: pastikan ID adalah angka
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: "ID harus berupa angka" });
    }

    try {
      const query = `
        UPDATE rombel 
        SET wali_kelas = $1, rombel = $2, tingkat = $3, l = $4, p = $5, jurusan = $6
        WHERE id = $7
        RETURNING *
      `;
      const values = [wali_kelas, rombel, tingkat, l, p, jurusan, id];

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

    async getAll(req, res) {
    try {
      const result = await pool.query(
        "SELECT wali_kelas, rombel, tingkat, jmlh_l, jmlh_p, jurusan FROM rombel ORDER BY id_rombel ASC"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching rombel:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

};
