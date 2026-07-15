const pool = require("../../config/database");

module.exports = {
  async PrintReport(req, res) {
    try {
      const id = req.user?.id;

      const userDb = await pool.query(
        `SELECT id_role, id_ptk, id_siswa, id_orangtua FROM users WHERE id_user = $1`,
        [id],
      );

      if (userDb.rows.length === 0) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      const { id_role, id_ptk, id_siswa, id_orangtua } = userDb.rows[0];
      const role = {
        admin: 1,
        BK: 102,
        wali_kelas: 103,
        siswa: 6,
        orang_tua: 7,
      };

      const { id_rombel, id_semester } = req.query;

      let queryParams = [];
      let whereClauses = [];

      queryParams.push(id_semester || null);

      let querySiswaText = `
        SELECT 
            siswa.id_siswa,
            siswa.nama as nama_siswa,
            siswa.nisn,
            rombel.nama_rombel,
            jurusan.nama_jurusan,
            walikelas.nama as walikelas,
            semester.nama_semester as semester,
            gurubk.nama as nama_bk 
        FROM siswa
        INNER JOIN anggota_rombel ON anggota_rombel.id_siswa = siswa.id_siswa
        INNER JOIN rombel ON rombel.id_rombel = anggota_rombel.id_rombel
        LEFT JOIN plotting_bk pbk ON pbk.id_rombel = rombel.id_rombel 
        LEFT JOIN ptk gurubk ON gurubk.id_ptk = pbk.id_ptk_bk
        LEFT JOIN jurusan ON jurusan.id_jurusan = rombel.id_jurusan
        LEFT JOIN ptk walikelas ON walikelas.id_ptk = rombel.id_ptk_wali
        LEFT JOIN semester ON semester.id_semester = anggota_rombel.id_semester
      `;

      whereClauses.push(`
  (
    ($1::int IS NOT NULL AND anggota_rombel.id_semester = $1) OR 
    ($1::int IS NULL AND semester.is_active = true)
  )
`);

      if (id_role === role.BK) {
        whereClauses.push(`pbk.id_ptk_bk = $${queryParams.length + 1}`);
        queryParams.push(id_ptk);
      } else if (id_role === role.wali_kelas) {
        whereClauses.push(`rombel.id_ptk_wali = $${queryParams.length + 1}`);
        queryParams.push(id_ptk);
      } else if (id_role === role.siswa) {
        whereClauses.push(`siswa.id_siswa = $${queryParams.length + 1}`);
        queryParams.push(id_siswa);
      } else if (id_role === role.orang_tua) {
        whereClauses.push(`siswa.id_orangtua = $${queryParams.length + 1}`);
        queryParams.push(id_orangtua);
      }

      if (id_rombel) {
        whereClauses.push(`rombel.id_rombel = $${queryParams.length + 1}`);
        queryParams.push(id_rombel);
      }

      if (req.query.id_siswa) {
        whereClauses.push(`siswa.id_siswa = $${queryParams.length + 1}`);
        queryParams.push(req.query.id_siswa);
      }

      if (whereClauses.length > 0) {
        querySiswaText += ` WHERE ` + whereClauses.join(" AND ");
      }

      querySiswaText += ` ORDER BY siswa.nama ASC`;

      let queryPelanggaranText = `
        SELECT 
            pelanggaran.id_siswa,
            pelanggaran.tanggal,
            pelanggaran.keterangan,
            popel.jenis_pelanggaran,
            popel.bobot as poin
        FROM pelanggaran_siswa pelanggaran
        LEFT JOIN poin_pelanggaran popel ON popel.id_poin = pelanggaran.id_poin
        WHERE 1=1
      `;
      let pelanggaranParams = [];
      if (id_semester) {
        pelanggaranParams.push(id_semester);
        queryPelanggaranText += ` AND pelanggaran.id_semester = $${pelanggaranParams.length}`;
      }
      if (req.query.id_siswa) {
        pelanggaranParams.push(req.query.id_siswa);
        queryPelanggaranText += ` AND pelanggaran.id_siswa = $${pelanggaranParams.length}`;
      }
      queryPelanggaranText += ` ORDER BY pelanggaran.tanggal DESC`;

      let queryPembinaanText = `
        SELECT 
            ss.id_siswa, 
            ss.tanggal, 
            ss.id_semester,
            ss.status AS status_sanksi,               
            pp.tahap_pembinaan AS tahap_akhir,        
            pp.catatan_perkembangan AS catatan_perkembangan,        
            pp.id_ptk_pendamping,
            ptk.nama AS nama_ptk_pendamping           
        FROM sanksi_siswa ss
        INNER JOIN progres_pembinaan pp ON pp.id_sanksi_siswa = ss.id_sanksi_siswa
        INNER JOIN ptk ptk ON ptk.id_ptk = pp.id_ptk_pendamping
        WHERE 1=1
      `;
      let pembinaanParams = [];
      if (id_semester) {
        pembinaanParams.push(id_semester);
        queryPembinaanText += ` AND ss.id_semester = $${pembinaanParams.length}`;
      }
      if (req.query.id_siswa) {
        pembinaanParams.push(req.query.id_siswa);
        queryPembinaanText += ` AND ss.id_siswa = $${pembinaanParams.length}`;
      }
      queryPembinaanText += ` ORDER BY ss.tanggal DESC`;

      const [resSiswa, resPelanggaran, resPembinaan] = await Promise.all([
        pool.query(querySiswaText, queryParams),
        pool.query(queryPelanggaranText, pelanggaranParams),
        pool.query(queryPembinaanText, pembinaanParams),
      ]);

      const daftarSiswa = resSiswa.rows;
      const semuaPelanggaran = resPelanggaran.rows;
      const semuaPembinaan = resPembinaan.rows;

      const laporanMap = {};

      daftarSiswa.forEach((siswa) => {
        laporanMap[siswa.id_siswa] = {
          id_siswa: siswa.id_siswa,
          nama_siswa: siswa.nama_siswa,
          nisn: siswa.nisn,
          rombel: siswa.nama_rombel,
          semester: siswa.semester,
          jurusan: siswa.nama_jurusan,
          walikelas: siswa.walikelas,
          bk: siswa.nama_bk || "Belum diplot",
          saldo_poin: 0,
          riwayat_pelanggaran: [],
          riwayat_pembinaan: [],
        };
      });

      // Masukkan data pelanggaran & jumlahkan ke saldo_poin
      semuaPelanggaran.forEach((pel) => {
        if (laporanMap[pel.id_siswa]) {
          const poinPelanggaran = parseInt(pel.poin, 10) || 0;

          laporanMap[pel.id_siswa].riwayat_pelanggaran.push({
            tanggal: pel.tanggal,
            jenis_pelanggaran: pel.jenis_pelanggaran,
            poin: poinPelanggaran,
            keterangan: pel.keterangan,
          });

          laporanMap[pel.id_siswa].saldo_poin += poinPelanggaran;
        }
      });

      semuaPembinaan.forEach((pem) => {
        if (laporanMap[pem.id_siswa]) {
          const namaBkDariRombel = laporanMap[pem.id_siswa].bk;
          laporanMap[pem.id_siswa].riwayat_pembinaan.push({
            tanggal: pem.tanggal,
            catatan_perkembangan: pem.catatan_perkembangan,
            status_sanksi: pem.status_sanksi,
            tahap_akhir: pem.tahap_akhir,
            guru_penamping: pem.nama_ptk_pendamping,
            pelaksana_bk: namaBkDariRombel,
          });
        }
      });

      const hasilAkhir = Object.values(laporanMap);

      res.json(hasilAkhir);
    } catch (error) {
      console.error("Error Printing Report:", error.message);
      res
        .status(500)
        .json({ error: "Internal Server Error: " + error.message });
    }
  },
};
