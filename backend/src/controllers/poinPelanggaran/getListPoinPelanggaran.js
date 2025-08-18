const pool = require("../../database/connection");

const getListPoinPelanggaran = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM poin_pelanggaran ORDER BY id_poin ASC"
    );
    res.json({
      total: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching pelanggaran:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getListPoinPelanggaran;
