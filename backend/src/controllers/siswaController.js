const pool = require("../../config/database");

module.exports = {
  //mengambil seluruh data siswa
  async getAll(req, res) {
    try {
      const id_user_dari_token = req.user?.id;

      const userDb = await pool.query(
        `SELECT id_role, id_ptk FROM users WHERE id_user = $1`,
        [id_user_dari_token],
      );

      const id_role = userDb.rows[0].id_role;
      const id_ptk = userDb.rows[0].id_ptk;
      const role = {
        admin: 1,
        wali_kelas: 103,
        BK: 102,
      };

      let queryParams = [];

      let queryText = `SELECT 
          siswa.id_siswa as id_siswa,
          siswa.nama as nama,
          siswa.nisn as nisn,
          siswa.alamat as alamat,
          siswa.no_telp as no_telp,
          siswa.email as email,
          agama.nama_agama AS agama,
          tingkat.nama_tingkat AS tingkat,
          rombel.nama_rombel AS rombel,
          walikelas.nama as walikelas,
          jurusan.nama_jurusan AS jurusan,
          COALESCE(anggota_rombel.saldo_poin, 0) AS total_poin
        FROM 
          siswa
        LEFT JOIN
          agama ON siswa.id_agama = agama.id_agama
        LEFT JOIN
         anggota_rombel ON siswa.id_siswa = anggota_rombel.id_siswa
        LEFT JOIN
          rombel ON anggota_rombel.id_rombel = rombel.id_rombel
        LEFT JOIN
         ptk walikelas ON rombel.id_ptk_wali = walikelas.id_ptk
        LEFT JOIN
          tingkat_pendidikan tingkat ON rombel.id_tingkat = tingkat.id_tingkat
        LEFT JOIN
          jurusan ON rombel.id_jurusan = jurusan.id_jurusan
        `;

      if (id_role === role.BK) {
        queryText += ` INNER JOIN plotting_bk pbk ON rombel.id_rombel = pbk.id_rombel WHERE pbk.id_ptk_bk = $1 `;
        queryParams.push(id_ptk);
      } else if (id_role === role.wali_kelas) {
        queryText += ` WHERE rombel.id_ptk_wali = $1 `;

        queryParams.push(id_ptk);
      }

      queryText += ` GROUP BY siswa.id_siswa, agama.nama_agama, walikelas.nama, rombel.id_rombel, rombel.nama_rombel, tingkat.nama_tingkat, jurusan.nama_jurusan, anggota_rombel.saldo_poin
        ORDER BY rombel.nama_rombel ASC`;

      const result = await pool.query(queryText, queryParams);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching siswa:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //mengambil seluruh data siswa menggunakan filter
  async getFiltered(req, res) {
    try {
      const { nisn, rombel, walikelas, search } = req.query;
      const id_user_dari_token = req.user?.id;

      const userDb = await pool.query(
        `SELECT id_role, id_ptk FROM users WHERE id_user = $1`,
        [id_user_dari_token],
      );

      const id_role = userDb.rows[0].id_role;
      const id_ptk = userDb.rows[0].id_ptk;
      const role = {
        admin: 1,
        wali_kelas: 103,
        BK: 102,
      };

      let query = `
        SELECT 
        DISTINCT ON (siswa.nama, siswa.id_siswa)
          siswa.nama as nama_siswa,
          siswa.nisn as nisn,
          siswa.alamat as alamat,
          siswa.no_telp as no_telp,
          siswa.email as email,
          agama.nama_agama AS nama_agama,
          rombel.nama_rombel AS rombel,
          walikelas.nama as walikelas,
          tingkat.nama_tingkat AS tingkat_kelas,
          jurusan.nama_jurusan AS jurusan,
          COALESCE(anggota_rombel.saldo_poin, 0) AS total_poin
        FROM 
          siswa
        LEFT JOIN
          agama ON siswa.id_agama = agama.id_agama
        LEFT JOIN
         anggota_rombel ON siswa.id_siswa = anggota_rombel.id_siswa
        LEFT JOIN
          rombel ON anggota_rombel.id_rombel = rombel.id_rombel
        LEFT JOIN
         ptk walikelas ON rombel.id_ptk_wali = walikelas.id_ptk
        LEFT JOIN
          tingkat_pendidikan tingkat ON rombel.id_tingkat = tingkat.id_tingkat
        LEFT JOIN
          jurusan ON rombel.id_jurusan = jurusan.id_jurusan
        WHERE
          1=1
      `;
      let params = [];
      let index = 1;

      if (nisn) {
        query += ` AND siswa.nisn ILIKE $${index}`;
        params.push(`%${nisn}%`);
        index++;
      }

      if (rombel) {
        query += ` AND rombel.nama_rombel ILIKE $${index}`;
        params.push(`%${rombel}%`);
        index++;
      }

      if (walikelas) {
        query += ` AND walikelas.nama ILIKE $${index}`;
        params.push(`%${walikelas}%`);
        index++;
      }

      if (search) {
        query += ` AND (siswa.nama ILIKE $${index} OR siswa.nisn ILIKE $${index})`;
        params.push(`%${search}%`);
        index++;
      }

      if (id_role === role.BK) {
        query += ` AND EXISTS (
        SELECT 1 FROM plotting_bk pbk 
        WHERE pbk.id_rombel = rombel.id_rombel AND pbk.id_ptk_bk = $${index}
      ) `;
        params.push(id_ptk);
        index++;
      } else if (id_role === role.wali_kelas) {
        query += ` AND rombel.id_ptk_wali = $${index} `;
        params.push(id_ptk);
        index++;
      }

      query += " ORDER BY siswa.nama ASC, siswa.id_siswa";

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      res.json({
        success: true,
        total: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      console.error("Error fetching filtered data siswa", error.message);
      res.status(500).json({ error: "Internal Server Error" + error.message });
    }
  },

  //mengambil seluruh data siswa menggunakan id
  async getById(req, res) {
    const { id } = req.params;
    const id_user_dari_token = req.user?.id;

    const userDb = await pool.query(
      `SELECT id_role, id_ptk FROM users WHERE id_user = $1`,
      [id_user_dari_token],
    );

    const id_role = userDb.rows[0].id_role;
    const id_ptk = userDb.rows[0].id_ptk;
    const role = {
      admin: 1,
      wali_kelas: 103,
      BK: 102,
    };

    try {
      let queryText = `
        SELECT
          DISTINCT ON (siswa.id_siswa)
          siswa.id_siswa as id_siswa,
          siswa.nama as nama,
          siswa.nisn as nisn,
          siswa.alamat as alamat,
          siswa.no_telp as no_telp,
          siswa.email as email,
          agama.nama_agama AS agama,
          tingkat.nama_tingkat AS tingkat,
          rombel.nama_rombel AS rombel,
          walikelas.nama as walikelas,
          jurusan.nama_jurusan AS jurusan,
          COALESCE(anggota_rombel.saldo_poin, 0) AS total_poin
        FROM 
          siswa
        LEFT JOIN
          agama ON siswa.id_agama = agama.id_agama
        LEFT JOIN
         anggota_rombel ON siswa.id_siswa = anggota_rombel.id_siswa
        LEFT JOIN
          rombel ON anggota_rombel.id_rombel = rombel.id_rombel
        LEFT JOIN
         ptk walikelas ON rombel.id_ptk_wali = walikelas.id_ptk
        LEFT JOIN
          tingkat_pendidikan tingkat ON rombel.id_tingkat = tingkat.id_tingkat
        LEFT JOIN
          jurusan ON rombel.id_jurusan = jurusan.id_jurusan
        WHERE 
          siswa.id_siswa = $1`;
      let queryParams = [id];

      if (id_role === role.BK) {
        queryText += ` AND EXISTS (
        SELECT 1 FROM plotting_bk pbk 
        WHERE pbk.id_rombel = rombel.id_rombel AND pbk.id_ptk_bk = $2
      ) `;
        queryParams.push(id_ptk);
      } else if (id_role === role.wali_kelas) {
        queryText += ` AND rombel.id_ptk_wali = $2 `;
        queryParams.push(id_ptk);
      }

      const result = await pool.query(queryText, queryParams);

      if (result.rows.length === 0) {
        return res.status(403).json({
          error: "Anda tidak memiliki akses",
        });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching siswa by Id:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
