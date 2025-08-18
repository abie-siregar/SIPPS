const pool = require("../../database/connection");

const createPoinPelanggaran = async (req, res) => {
  const { jenis_penilaian, bobot, jenis_pelanggaran } = req.body;

  // Validasi input
  if (!jenis_penilaian || typeof bobot !== "number" || !jenis_pelanggaran) {
    return res.status(400).json({
      error:
        "Jenis penilaian, bobot (angka), dan jenis pelanggaran harus diisi dengan benar.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO poin_pelanggaran (jenis_penilaian, bobot, jenis_pelanggaran)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [jenis_penilaian, bobot, jenis_pelanggaran]
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
