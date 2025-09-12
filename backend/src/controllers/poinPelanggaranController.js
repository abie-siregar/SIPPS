const pool = require("../../config/database");

module.exports = {
  async create(req, res) {
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
  },

  async getList(req, res) {
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
  },

  async getById(req, res) {
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
      console.error("Error fetching poin pelanggaran by ID:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async update(req, res) {
    const { id_poin } = req.params;
    const { jenis_penilaian, bobot, jenis_pelanggaran, is_active } = req.body;

    if (isNaN(id_poin)) {
      return res.status(400).json({ error: "ID harus berupa angka" });
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
        return res.status(404).json({ error: "Data tidak ditemukan" });
      }

      res.json({
        message: "Data berhasil diupdate",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating data bobot pelanggaran:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
