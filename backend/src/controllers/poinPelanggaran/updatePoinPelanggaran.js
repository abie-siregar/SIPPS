const pool = require("../../database/connection");

const updatebobotPelanggaran = async (req, res) => {
  const { id_poin } = req.params;
  const { jenis_penilaian, bobot, jenis_pelanggaran, is_active } = req.body;

  if (isNaN(id_poin)) {
    return res.status(400).json({ error: "ID Harus berupa angka" });
  }

  if (
    !jenis_penilaian ||
    typeof bobot !== "number" ||
    !jenis_pelanggaran ||
    typeof is_active !== "boolean"
  ) {
    return res.status(400).json({
      error:
        "Jenis Penilaian, Bobot, Jenis Pelanggaran, atau Active harus diisi dengan benar",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE poin_pelanggaran
            SET jenis_penilaian = $1, bobot = $2, jenis_pelanggaran = $3, is_active = $4
            WHERE id_poin = $5
            RETURNING *`,
      [jenis_penilaian, bobot, jenis_pelanggaran, is_active, id_poin]
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
