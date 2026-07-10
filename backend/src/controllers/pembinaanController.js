const pool = require("../../config/database");

const pembinaanController = {
  async getAll(req, res) {
    const id = req.user?.id;

    const client = await pool.connect();

    try {
      const userDb = await pool.query(
        `SELECT id_role, id_ptk, id_siswa, id_orangtua FROM users WHERE id_user = $1`,
        [id],
      );

      const { id_role, id_ptk, id_siswa, id_orangtua } = userDb.rows[0];

      const role = {
        admin: 1,
        BK: 102,
        wali_kelas: 103,
        siswa: 6,
        orang_tua: 7,
      };

      let queryParams = [];
      let whereClauses = [];

      if (id_role === role.BK) {
        whereClauses.push(
          `r.id_rombel IN (SELECT id_rombel FROM plotting_bk WHERE id_ptk_bk = $1)`,
        );
        queryParams.push(id_ptk);
      } else if (id_role === role.wali_kelas) {
        whereClauses.push(`r.id_ptk_wali = $1`);
        queryParams.push(id_ptk);
      } else if (id_role === role.siswa) {
        whereClauses.push(`ss.id_siswa = $1`);
        queryParams.push(id_siswa);
      } else if (id_role === role.orang_tua) {
        whereClauses.push(`s.id_orangtua = $1`);
        queryParams.push(id_orangtua);
      }

      const whereStatement =
        whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const queryText = `
      SELECT 
        ss.id_sanksi_siswa,
        ss.id_siswa,
        s.nama,
        r.nama_rombel,
        ms.nama_sanksi,
        ss.tanggal AS tanggal_sanksi,
        ss.status AS status_sanksi,
        pp.tahap_pembinaan AS tahap_akhir,
        pp.id_progres AS id_progres
      FROM sanksi_siswa ss
      LEFT JOIN siswa s ON s.id_siswa = ss.id_siswa
      LEFT JOIN anggota_rombel ar ON ar.id_siswa = s.id_siswa
      LEFT JOIN rombel r ON r.id_rombel = ar.id_rombel
      LEFT JOIN master_sanksi ms ON ms.id_master_sanksi = ss.id_master_sanksi
      LEFT JOIN (
        SELECT DISTINCT ON (id_sanksi_siswa) 
          id_sanksi_siswa, id_progres, tahap_pembinaan
        FROM progres_pembinaan
        ORDER BY id_sanksi_siswa, tanggal DESC, id_progres DESC
      ) pp ON pp.id_sanksi_siswa = ss.id_sanksi_siswa
      ${whereStatement} 
      ORDER BY ss.tanggal DESC;
    `;

      const result = await pool.query(queryText, queryParams);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching sanksi:", error.message);
      res
        .status(500)
        .json({ error: "Internal Server Error: " + error.message });
    } finally {
      client.release();
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
         FROM 
          progres_pembinaan pp
         LEFT JOIN 
          ptk p ON p.id_ptk = pp.id_ptk_pendamping
         WHERE 
          pp.id_sanksi_siswa = $1
         ORDER BY 
          pp.tanggal ASC`,
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
