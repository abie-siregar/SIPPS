const pool = require("../../config/database");

module.exports = {
  //mengambil seluruh data siswa
  async getAll(req, res) {
    try {
      const result = await pool.query(
        `SELECT 
          siswa.nama as nama,
          siswa.nisn as nisn,
          siswa.alamat as alamat,
          siswa.no_telp as no_telp,
          siswa.email as email,
          agama.nama_agama AS agama,
          tingkat.nama_tingkat AS tingkat,
          rombel.nama_rombel AS rombel,
          walikelas.nama as walikelas,
          jurusan.nama_jurusan AS jurusan
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
        ORDER BY 
          rombel
        ASC`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching siswa:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //mengambil seluruh data siswa menggunakan filter
  async getFiltered(req, res) {
    try {
      const {nisn, rombel, walikelas, search} = req.query;

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
          jurusan.nama_jurusan AS jurusan
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

      query += " ORDER BY siswa.nama ASC, siswa.id_siswa";

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
      console.error("Error fetching filtered data siswa", error.message);
      res.status(500).json({error : "Internal Server Error" + error.message   });
    }
  },

  //mengambil seluruh data siswa menggunakan id
  async getById(req, res) {
    const { id } = req.params;

    // if (isNaN(siswa_id)) {
    //   return res.status(400).json({ error: "ID harus berupa angka" });
    // }

    try {
      const result = await pool.query(
        `
        SELECT
          DISTINCT ON (siswa.id_siswa)
          siswa.nama as nama_siswa,
          siswa.nisn as nisn,
          siswa.alamat as alamat,
          siswa.no_telp as no_telp,
          siswa.email as email,
          agama.nama_agama AS nama_agama,
          rombel.nama_rombel AS rombel,
          walikelas.nama as walikelas,
          tingkat.nama_tingkat AS tingkat_kelas,
          jurusan.nama_jurusan AS jurusan
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
          siswa.id_siswa = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Data siswa tidak ditemukan" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching siswa by Id:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

};
