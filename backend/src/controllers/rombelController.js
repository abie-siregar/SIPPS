const pool = require("../../config/database");

module.exports = {

  //mengambil seluruh rombel
  async getAll(req, res) {
  try {
    const result = await pool.query(
      `SELECT 
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
      GROUP BY 
          rombel.nama_rombel,
          tingkat.nama_tingkat,
          jurusan.nama_jurusan,
          walikelas.nama
        ORDER by
         nama_rombel
        ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error Fetching rombel", error.message);
    res.status(500).json({error: "Internal Server Error"})
  }
  },

  //mengambil seluruh data rombel menggunakan filter
  async getFiltered(req, res) {
    try {
      const { tingkat, jurusan, search} = req.query;

      let query = 
      `SELECT 
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
          params.push(`%${jurusan.toLowerCase().replace(/\s+/g, '')}%`);
          index++;
      }

      if (search) {
        query += ` AND (
          REPLACE(LOWER(tingkat.nama_tingkat), ' ', '') ILIKE $${index} OR 
          REPLACE(LOWER(jurusan.nama_jurusan), ' ', '') ILIKE $${index} OR 
          REPLACE(LOWER(rombel.nama_rombel), ' ', '') ILIKE $${index})`;
        params.push(`%${search.toLowerCase().replace(/\s+/g, '')}%`);
        index++;
      }

      query += `
      GROUP BY 
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
        data: result.rows
      });
    }
    catch (error) {
      console.error("Gagal mengambil data rombel", error);
      res.status(500).json({error : "Internal Server Error " + error.message});
    }
  },

  // //update untuk data rombel
  // async update(req, res) {
  //   const { rombel_id } = req.params;
  //   const { nama, ptk_id_dapodik, tingkat_id, jurusan_id  } = req.body;

  //   if (isNaN(parseInt(rombel_id))) {
  //     return res.status(400).json({ error: "ID harus berupa angka" });
  //   }

  //   try {
  //     const query = `
  //       WITH updated AS (
  //         UPDATE 
  //           rombel 
  //         SET 
  //           nama = $1, 
  //           ptk_id_dapodik = $2, 
  //           tingkat_id = $3, 
  //           jurusan_id = $4
  //         WHERE rombel_id = $5
  //         RETURNING *)
  //       SELECT 
  //         u.rombel_id,
  //         u.nama,
  //         p.nama,
  //         t.tingkat_id_str,
  //         j.jurusan_id_str,
  //       FROM
  //         updated u
  //       LEFT JOIN
  //         ptk p ON p.ptk_id_dapodik = u.ptk_id_dapodik
  //         tingkat t ON t.tingkat_id = u.tingkat_id
  //         jurusan j ON j.jurusan_id = u.jurusan_id;

  //     `;
  //     const values = [nama, ptk_id_dapodik, tingkat_id, jurusan_id, rombel_id];

  //     const result = await pool.query(query, values);

  //     if (result.rows.length === 0) {
  //       return res.status(404).json({ error: "Data rombel tidak ditemukan" });
  //     }

  //     res.json({
  //       message: "Data rombel berhasil diperbarui",
  //       data: result.rows[0],
  //     });
  //   } catch (error) {
  //     console.error("Gagal memperbarui data rombel:", error);
  //     res.status(500).json({ error: "Internal Server Error" });
  //   }
  // },
  
};
