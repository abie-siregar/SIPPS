const pool = require("../../database/connection");

const updateRombel = async (req, res) => {
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
};

module.exports = updateRombel;
