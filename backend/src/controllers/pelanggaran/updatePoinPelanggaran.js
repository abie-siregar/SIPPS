const pool = require("../../database/connection");

const updatebobotPelanggaran = async (req, res) => {
  const { id } = req.params;
  const { jenis_pelanggaran, bobot, jenis, is_active } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID Harus berupa angka" });
  }

  if (
    !jenis_pelanggaran ||
    typeof bobot !== "number" ||
    !jenis ||
    typeof is_active !== "boolean"
  ) {
    return res.status(400).json({
      error:
        "Jenis Pelanggaran, Bobot, Jenis Pelanggaran, atau Active harus diisi dengan benar",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE pelanggaran
            SET jenis_pelanggaran = $1, bobot = $2, jenis = $3, is_active = $4
            WHERE id = $5
            RETURNING *`,
      [jenis_pelanggaran, bobot, jenis, is_active, id]
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
