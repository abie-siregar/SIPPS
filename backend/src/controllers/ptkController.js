const pool = require("../../config/database");

module.exports = {
  async getAll(req, res) {
    try {
      const result = await pool.query(
        "SELECT nama, nuptk, jenis_ptk, tugas_tambahan, hp, email FROM ptk ORDER BY id_ptk ASC"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching ptk:", error.message);
      res.status(500).json({ error: "Internall Server Error" });
    }
  },

    async getEverything(req, res) {
    try {
      const result = await pool.query(
        "SELECT nama, nuptk, nip, jk, agama, alamat, kelurahan, kecamatan, hp, jenis_ptk, mata_pelajaran, gelar_depan, gelar_belakang, tugas_tambahan, ket_tugas_tambahan, email FROM ptk ORDER BY id_ptk ASC"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching ptk:", error.message);
      res.status(500).json({ error: "Internall Server Error" });
    }
  },
};