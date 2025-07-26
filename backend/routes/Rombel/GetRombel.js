const express = require("express");
const router = express.Router();
const pool = require("../../db");

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const idNumber = parseInt(id, 10);

  if (isNaN(idNumber)) {
    return res.status(400).json({ error: "ID harus berupa angka" });
  }

  try {
    const result = await pool.query("SELECT * FROM rombel WHERE id = $1", [
      idNumber,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Gagal mengambil data rombel:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
