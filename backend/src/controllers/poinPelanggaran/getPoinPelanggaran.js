const pool = require("../../database/connection");

const getPoinPelanggaran = async (req, res) => {
  const { id_poin } = req.params;

  if (isNaN(id_poin)) {
    return res.status(400).json({ error: "ID harus berupa angka" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM poin_pelanggaran WHERE id_poin = $1",
      [id_poin]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching poin pelanggaran by ID : ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getPoinPelanggaran;
