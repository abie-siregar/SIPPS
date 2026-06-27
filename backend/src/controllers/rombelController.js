const pool = require("../../config/database");

module.exports = {
  //mengambil seluruh rombel
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

      let queryText = `SELECT 
        rombel.nama_rombel as rombel,
        tingkat.nama_tingkat as tingkat,
        jurusan.nama_jurusan as jurusan,
        walikelas.nama as walikelas,
        COUNT(anggota.id_siswa)::integer as jumlah_siswa
      FROM 
        rombel rombel
      LEFT JOIN
        tingkat_pendidikan tingkat on rombel.id_tingkat = tingkat.id_tingkat
      LEFT JOIN
        jurusan jurusan on jurusan.id_jurusan = rombel.id_jurusan
      LEFT JOIN
        ptk walikelas on walikelas.id_ptk = rombel.id_ptk_wali
      LEFT join
        anggota_rombel anggota on rombel.id_rombel = anggota.id_rombel
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
      GROUP BY 
        rombel.id_rombel,
        rombel.nama_rombel,
        tingkat.nama_tingkat,
        jurusan.nama_jurusan,
        walikelas.nama
      ORDER BY
        rombel.nama_rombel ASC
    `;

      const result = await pool.query(queryText, queryParams);

      res.json(result.rows);
    } catch (error) {
      console.error("Error Fetching rombel", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //mengambil seluruh data rombel menggunakan filter
  async getFiltered(req, res) {
    try {
      const { tingkat, jurusan, search } = req.query;
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

      let query = `SELECT 
        rombel.id_rombel,
        rombel.nama_rombel as rombel,
        tingkat.nama_tingkat as tingkat,
        jurusan.nama_jurusan as jurusan,
        walikelas.nama as walikelas,
        COUNT(anggota.id_siswa)::integer as jumlah_siswa
      FROM 
        rombel rombel
      LEFT JOIN
        tingkat_pendidikan tingkat on rombel.id_tingkat = tingkat.id_tingkat
      LEFT JOIN
        jurusan jurusan on jurusan.id_jurusan = rombel.id_jurusan
      LEFT JOIN
        ptk walikelas on walikelas.id_ptk = rombel.id_ptk_wali
      LEFT join
        anggota_rombel anggota on rombel.id_rombel = anggota.id_rombel
      WHERE 
        1=1  
      `;

      let params = [];
      let index = 1;

      if (tingkat) {
        query += ` AND tingkat.id_tingkat = $${index}`;
        params.push(tingkat);
        index++;
      }

      if (jurusan) {
        query += ` AND REPLACE(LOWER(jurusan.nama_jurusan), ' ', '') ILIKE $${index}`;
        params.push(`%${jurusan.toLowerCase().replace(/\s+/g, "")}%`);
        index++;
      }

      if (search) {
        query += ` AND (
          REPLACE(LOWER(tingkat.nama_tingkat), ' ', '') ILIKE $${index} OR 
          REPLACE(LOWER(jurusan.nama_jurusan), ' ', '') ILIKE $${index} OR 
          REPLACE(LOWER(rombel.nama_rombel), ' ', '') ILIKE $${index})`;
        params.push(`%${search.toLowerCase().replace(/\s+/g, "")}%`);
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

      query += `
      GROUP BY
        rombel.id_rombel,
        rombel.nama_rombel,
        tingkat.nama_tingkat,
        jurusan.nama_jurusan,
        walikelas.nama,
        tingkat.id_tingkat
      ORDER BY 
        tingkat.id_tingkat ASC, 
        jurusan.nama_jurusan ASC, 
        rombel.nama_rombel ASC
    `;

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
      console.error("Gagal mengambil data rombel", error);
      res.status(500).json({ error: "Internal Server Error " + error.message });
    }
  },
};
