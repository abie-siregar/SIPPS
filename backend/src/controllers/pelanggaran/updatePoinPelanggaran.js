const pool = require("../../database/connection");

const updatebobotPelanggaran = async (req, res) => {
  const { id } = req.params;
  const { jenis_pelanggaran, bobot, jenis } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID Harus berupa angka" });
  }

  if (!jenis_pelanggaran || typeof bobot !== "number" || !jenis) {
    return res.status(400).json({
      error:
        "Jenis Pelanggaran, Bobot, atau Jenis Pelanggaran harus diisi dengan benar",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE pelanggaran
            SET jenis_pelanggaran = $1, bobot = $2, jenis = $3
            WHERE id = $4
            RETURNING *`,
      [jenis_pelanggaran, bobot, jenis, id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Data tidak ditemukan" });
    }

    res.json({ message: "Data berhasil diupdate :", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating data bobot pelanggaran :", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = updatebobotPelanggaran;
