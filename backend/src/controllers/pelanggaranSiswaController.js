const pool = require("../../config/database");

module.exports = {
  //menambahkan pelanggaran baru
  async create(req, res) {
    const { id_siswa, id_ptk, id_semester, id_poin, tanggal, keterangan } =
      req.body;

    // Validasi input
    if (
      !tanggal ||
      !keterangan ||
      !id_siswa ||
      !id_ptk ||
      !id_semester ||
      !id_poin
    ) {
      return res.status(400).json({
        error:
          "tanggal, keterangan, ID siswa, ID ptk, ID semester, dan ID poin harus diisi dengan benar.",
      });
    }

    try {
      const result = await pool.query(
        `INSERT INTO 
                pelanggaran_siswa (id_siswa, id_poin, id_ptk, id_semester, tanggal, keterangan)
            VALUES 
                ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
        [id_siswa, id_poin, id_ptk, id_semester, tanggal, keterangan],
      );

      res.status(201).json({
        message: "Data pelanggaran siswa berhasil ditambahkan",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Gagal menambahkan data pelanggaran siswa :",
        error.message,
      );
      res.status(500).json({ error: "Internal Server Error " + error.message });
    }
  },

  //mengambil seluruh data pelanggaran_siswa
  async getAll(req, res) {
    try {
      const id = req.user?.id;

      const userDb = await pool.query(
        `SELECT id_role, id_ptk FROM users WHERE id_user = $1`,
        [id],
      );

      if (userDb.rows.length === 0) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      const id_role = userDb.rows[0].id_role;
      const id_ptk = userDb.rows[0].id_ptk;
      const role = { admin: 1, wali_kelas: 103, BK: 102 };

      let queryParams = [];

      let queryText = `
        SELECT 
            distinct on (pelanggaran.tanggal, siswa.id_siswa, pelanggaran.keterangan)
            pelanggaran.id_pelanggaran,
            pelanggaran.id_siswa,
            pelanggaran.id_poin,
            pelanggaran.id_ptk,
            pelanggaran.id_semester,
            pelanggaran.tanggal,
            pelanggaran.keterangan,
            popel.jenis_penilaian,
            popel.jenis_pelanggaran,
            popel.bobot, 
            ptk.nama as nama_ptk,
            jabatan.nama_jabatan,
            siswa.nama as nama_siswa,
            siswa.nisn,
            semester.nama_semester,
            walikelas.nama as walikelas,
            rombel.nama_rombel,
            jurusan.nama_jurusan
        FROM
            pelanggaran_siswa pelanggaran
        LEFT JOIN
            poin_pelanggaran popel ON popel.id_poin = pelanggaran.id_poin
        LEFT JOIN
            ptk ON ptk.id_ptk = pelanggaran.id_ptk
        LEFT JOIN
            siswa ON siswa.id_siswa = pelanggaran.id_siswa
        LEFT JOIN
            anggota_rombel ON anggota_rombel.id_siswa = pelanggaran.id_siswa
        LEFT JOIN
            rombel ON rombel.id_rombel = anggota_rombel.id_rombel
        LEFT JOIN
            semester ON semester.id_semester = pelanggaran.id_semester
        LEFT JOIN
            jurusan ON jurusan.id_jurusan = rombel.id_jurusan
        LEFT JOIN
            ptk walikelas ON walikelas.id_ptk = rombel.id_ptk_wali
        LEFT JOIN
            jabatan_ptk jabatan ON jabatan.id_jabatan = ptk.id_jabatan
        `;

      if (id_role === role.BK) {
        queryText += `
        INNER JOIN plotting_bk pbk ON rombel.id_rombel = pbk.id_rombel
        WHERE pbk.id_ptk_bk = $1
      `;
        queryParams.push(id_ptk);
      } else if (id_role === role.wali_kelas) {
        queryText += `
        WHERE rombel.id_ptk_wali = $1
      `;
        queryParams.push(id_ptk);
      }
      queryText += `
      ORDER BY
        pelanggaran.tanggal DESC, 
        siswa.id_siswa
    `;

      const result = await pool.query(queryText, queryParams);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching ptk:", error.message);
      res.status(500).json({ error: "Internal Server Error " + error.message });
    }
  },

  //mengambil seluruh data pelanggaran_siswa BY Filter
  async getFiltered(req, res) {
    try {
      const { id_siswa, id_semester } = req.query;

      const whereConditions = [];
      const queryParams = [];

      if (id_siswa) {
        queryParams.push(id_siswa);
        whereConditions.push(`pelanggaran.id_siswa = $${queryParams.length}`);
      }

      if (id_semester) {
        queryParams.push(id_semester);
        whereConditions.push(
          `pelanggaran.id_semester = $${queryParams.length}`,
        );
      }
      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const query = `
            SELECT 
            distinct on (pelanggaran.tanggal, siswa.id_siswa, pelanggaran.keterangan)
            pelanggaran.id_pelanggaran,
            pelanggaran.id_siswa,
            pelanggaran.id_poin,
            pelanggaran.id_ptk,
            pelanggaran.id_semester,
            pelanggaran.tanggal,
            pelanggaran.keterangan,
            popel.jenis_penilaian,
            popel.jenis_pelanggaran,
            popel.bobot, 
            ptk.nama as nama_ptk,
            jabatan.nama_jabatan,
            siswa.nama as nama_siswa,
            siswa.nisn,
            semester.nama_semester,
            walikelas.nama as walikelas,
            rombel.nama_rombel,
            jurusan.nama_jurusan
        FROM
            pelanggaran_siswa pelanggaran
        LEFT JOIN
            poin_pelanggaran popel ON popel.id_poin = pelanggaran.id_poin
        LEFT JOIN
            ptk ON ptk.id_ptk = pelanggaran.id_ptk
        LEFT JOIN
            siswa ON siswa.id_siswa = pelanggaran.id_siswa
        LEFT JOIN
            anggota_rombel ON anggota_rombel.id_siswa = pelanggaran.id_siswa
        LEFT JOIN
            rombel ON rombel.id_rombel = anggota_rombel.id_rombel
        LEFT JOIN
            semester ON semester.id_semester = pelanggaran.id_semester
        LEFT JOIN
            jurusan ON jurusan.id_jurusan = rombel.id_jurusan
        LEFT JOIN
            ptk walikelas ON walikelas.id_ptk = rombel.id_ptk_wali
        LEFT JOIN
            jabatan_ptk jabatan ON jabatan.id_jabatan = ptk.id_jabatan
            ${whereClause}
        ORDER BY
            pelanggaran.tanggal
        DESC, siswa.id_siswa
        `;

      const result = await pool.query(query, queryParams);

      res.json({
        success: true,
        total: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "Error fetching filtered pelanggaran siswa:",
        error.message,
      );
      res
        .status(500)
        .json({ error: "Internal Server Error: " + error.message });
    }
  },

  // Memperbaharui data pelanggaran_siswa
  async update(req, res) {
    const { id } = req.params;
    const { id_ptk, id_poin, id_semester, tanggal, keterangan } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID harus berupa angka" });
    }
    // Validasi input
    if (!tanggal || !keterangan || !id_ptk || !id_poin || !id_semester) {
      return res.status(400).json({
        error: "Data pelanggaran harus di isi dengan benar!",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE 
                pelanggaran_siswa
            SET 
                id_ptk = $1, id_poin = $2, id_semester = $3, tanggal = $4, keterangan = $5, updated_at = CURRENT_TIMESTAMP
            WHERE 
                id_pelanggaran = $6 
            RETURNING *`,

        [id_ptk, id_poin, id_semester, tanggal, keterangan, id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Data tidak ditemukan" });
      }

      res.json({
        message: "Data berhasil diupdate",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating data pelanggaran:", error.message);
      res.status(500).json({ error: "Internal Server Error " + error.message });
    }
  },

  //menghapus data pelanggaran_siswa
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `DELETE FROM 
                pelanggaran_siswa 
            WHERE 
                id_pelanggaran = $1`,
        [id],
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ message: "Data pelanggaran tidak ditemukan" });
      }
      res.json({
        message: "Data Pelanggaran Berhasil dihapus",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // mengambil data semester
  async getSemesters(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM semester ORDER BY id_semester DESC",
      );
      res.json(result.rows);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal Server Error: " + error.message });
    }
  },
};
