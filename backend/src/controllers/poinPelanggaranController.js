const pool = require("../../config/database");

module.exports = {

  //Menambahkan data Poin_pelanggaran
  async create(req, res) {
    const { jenis_penilaian, jenis_pelanggaran, bobot } = req.body;

    // Validasi input
    if (!jenis_penilaian || typeof bobot !== "number" || !jenis_pelanggaran) {
      return res.status(400).json({
        error:
          "Jenis penilaian, bobot (angka), dan jenis pelanggaran harus diisi dengan benar.",
      });
    }

    try {
      const result = await pool.query(
        `INSERT INTO poin_pelanggaran (jenis_penilaian,jenis_pelanggaran, bobot )
         VALUES ($1, $2, $3)
         RETURNING *`,
        [jenis_penilaian, jenis_pelanggaran, bobot]
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

  // Mengambil Seluruh Data Poin_pelanggaran
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

  // Mengambil data poin_pelanggaran berdasarkan ID
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

  // Memperbaharui data Poin_pelanggaran
  async update(req, res) {
    const { id_poin } = req.params;
    const { jenis_penilaian, jenis_pelanggaran, bobot , is_active } = req.body;

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
          "Jenis Penilaian, Bobot, Jenis Pelanggaran, atau Active harus di isi dengan benar",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE poin_pelanggaran
         SET jenis_penilaian = $1, jenis_pelanggaran = $2, bobot = $3, is_active = $4
         WHERE id_poin = $5
         RETURNING *`,
        [jenis_penilaian, jenis_pelanggaran, bobot, is_active, id_poin]
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

  // Menghapus Data Poin_pelanggaran
  async delete(req, res){
    try {
      const {id_poin} = req.params;
      const result = await pool.query (" DELETE FROM poin_pelanggaran WHERE id_poin = $1", [id_poin]);
      if ( result.rowCount === 0 ){
        return res.status(404).json({message: "Data Poin tidak ditemukan"})
      }
      res.json({
        message: "Data Poin Pelanggaran Berhasil dihapus"
      })
    } catch (error) {
      res.status(500).json({error: error.message});
    }
  }
};
