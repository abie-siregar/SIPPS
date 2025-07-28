const pool = require("../../database/connection");

const getListRombel = async (req, res) => {
  const { tingkat, jurusan, search } = req.body;

  try {
    let query = "SELECT * FROM rombel WHERE 1=1";
    const values = [];

    if (tingkat && Array.isArray(tingkat) && tingkat.length > 0) {
      const placeholders = tingkat
        .map((_, i) => `$${values.length + i + 1}`)
        .join(", ");
      query += ` AND tingkat IN (${placeholders})`;
      values.push(...tingkat);
    }

    if (jurusan && Array.isArray(jurusan) && jurusan.length > 0) {
      const placeholders = jurusan
        .map((_, i) => `$${values.length + i + 1}`)
        .join(", ");
      query += ` AND jurusan IN (${placeholders})`;
      values.push(...jurusan);
    }

    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      query += ` AND LOWER(wali_kelas) LIKE $${values.length}`;
    }

    query += " ORDER BY id ASC";

    const result = await pool.query(query, values);
    res.json({
      total: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Gagal mengambil data rombel:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getListRombel;
