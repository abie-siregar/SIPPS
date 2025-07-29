const pool = require("../../database/connection");

const createPoinPelanggaran = async (req, res) => {
  const { jenis_pelanggaran, bobot, jenis } = req.body;

  // Validasi input
  if (!jenis_pelanggaran || typeof bobot !== "number" || !jenis) {
    return res.status(400).json({
      error:
        "Jenis pelanggaran, bobot (angka), dan jenis pelanggaran harus diisi dengan benar.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO pelanggaran (jenis_pelanggaran, bobot, jenis)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [jenis_pelanggaran, bobot, jenis]
    );

    res.status(201).json({
      message: "Data pelanggaran berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Gagal menambahkan data pelanggaran:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = createPoinPelanggaran;
