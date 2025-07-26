const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  const { jurusan, tingkat, search } = req.query;

  try {
    let query = "SELECT * FROM rombel WHERE 1=1";
    const values = [];

    // Handle array or string (Express akan ubah jadi array jika dikirim berkali-kali)
    if (tingkat) {
      const tingkatArray = Array.isArray(tingkat) ? tingkat : [tingkat];
      if (tingkatArray.length > 0) {
        const placeholders = tingkatArray
          .map((_, i) => `$${values.length + i + 1}`)
          .join(", ");
        query += ` AND tingkat IN (${placeholders})`;
        values.push(...tingkatArray);
      }
    }

    if (jurusan) {
      const jurusanArray = Array.isArray(jurusan) ? jurusan : [jurusan];
      if (jurusanArray.length > 0) {
        const placeholders = jurusanArray
          .map((_, i) => `$${values.length + i + 1}`)
          .join(", ");
        query += ` AND jurusan IN (${placeholders})`;
        values.push(...jurusanArray);
      }
    }

    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      query += ` AND LOWER(wali_kelas) LIKE $${values.length}`;
    }

    query += " ORDER BY id ASC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Gagal mengambil data rombel:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
