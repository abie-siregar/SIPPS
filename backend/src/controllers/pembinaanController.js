const pool = require("../../config/database");

const pembinaanController = {
  async getAll(req, res) {
    try {
      const result = await pool.query(
        `SELECT 
          ss.id_sanksi_siswa,
          ss.id_siswa,
          s.nama,
          r.nama_rombel,
          ms.nama_sanksi,
          ss.tanggal AS tanggal_sanksi,
          ss.status AS status_sanksi,
          (
            SELECT tahap_pembinaan 
            FROM progres_pembinaan 
            WHERE id_sanksi_siswa = ss.id_sanksi_siswa 
            ORDER BY tanggal DESC, id_progres DESC LIMIT 1
          ) AS tahap_akhir
         FROM sanksi_siswa ss
         INNER JOIN siswa s ON s.id_siswa = ss.id_siswa
         INNER JOIN anggota_rombel ar ON ar.id_siswa = s.id_siswa
         INNER JOIN rombel r ON r.id_rombel = ar.id_rombel
         INNER JOIN master_sanksi ms ON ms.id_master_sanksi = ss.id_master_sanksi
         ORDER BY ss.tanggal DESC`,
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Gagal mengambil data pembinaan:", error.message);
      res
        .status(500)
        .json({ error: "Internal Server Error: " + error.message });
    }
  },

  async getDetailStepper(req, res) {
    const { id } = req.params;

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: "ID Sanksi Siswa harus berupa angka" });
    }

    try {
      const result = await pool.query(
        `SELECT 
          pp.id_progres,
          pp.tanggal,
          pp.tahap_pembinaan,
          pp.catatan_perkembangan,
          p.nama AS nama_pendamping
         FROM progres_pembinaan pp
         LEFT JOIN ptk p ON p.id_ptk = pp.id_ptk_pendamping
         WHERE pp.id_sanksi_siswa = $1
         ORDER BY pp.tanggal ASC`,
        [id],
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Riwayat pembinaan tidak ditemukan" });
      }

      res.json(result.rows);
    } catch (error) {
      console.error("Gagal mengambil detail stepper:", error.message);
      res
        .status(500)
        .json({ error: "Internal Server Error: " + error.message });
    }
  },

  async nextStep(req, res) {
    const {
      id_sanksi_siswa,
      tahap_pembinaan,
      catatan_perkembangan,
      id_ptk_pendamping,
    } = req.body;

    if (
      !id_sanksi_siswa ||
      !tahap_pembinaan ||
      !catatan_perkembangan ||
      !id_ptk_pendamping
    ) {
      return res.status(400).json({
        error:
          "ID sanksi siswa, tahap pembinaan, catatan, dan PTK pendamping wajib diisi.",
      });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const sanksiCheck = await client.query(
        `SELECT status FROM sanksi_siswa WHERE id_sanksi_siswa = $1`,
        [id_sanksi_siswa],
      );

      if (sanksiCheck.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Data sanksi siswa tidak ditemukan." });
      }

      const result = await client.query(
        `INSERT INTO progres_pembinaan 
            (id_sanksi_siswa, tanggal, tahap_pembinaan, catatan_perkembangan, id_ptk_pendamping)
         VALUES 
            ($1, NOW(), $2, $3, $4)
         RETURNING *`,
        [
          id_sanksi_siswa,
          tahap_pembinaan,
          catatan_perkembangan,
          id_ptk_pendamping,
        ],
      );

      let statusBaruSanksi = "DIBINA";
      if (tahap_pembinaan === "SELESAI") {
        statusBaruSanksi = "SELESAI";
      }

      await client.query(
        `UPDATE sanksi_siswa 
         SET status = $1 
         WHERE id_sanksi_siswa = $2`,
        [statusBaruSanksi, id_sanksi_siswa],
      );

      await client.query("COMMIT");

      res.status(201).json({
        message: `Berhasil mencatat perkembangan pembinaan ke status: ${tahap_pembinaan}`,
        data: result.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Gagal memperbarui progres pembinaan:", error.message);
      res
        .status(500)
        .json({ error: "Internal Server Error: " + error.message });
    } finally {
      client.release();
    }
  },
};

module.exports = pembinaanController;
