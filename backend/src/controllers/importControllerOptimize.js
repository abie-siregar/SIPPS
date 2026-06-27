const { count } = require("console");
const pool = require("../../config/database");
const fs = require("fs");
const path = require("path");

module.exports = {

  // Import Data PTK dari Dapodik getGtk.json
  // async importPtk(req, res) {
  //   try {
  //     const filePath = path.join(__dirname, "../data/getGtk.json");
  //     const rawData = fs.readFileSync(filePath, "utf-8");
  //     const dapodikData = JSON.parse(rawData);

  //     const dataGtk = Array.isArray(dapodikData)
  //       ? dapodikData
  //       : dapodikData.rows;

  //     const results = [];

  //     for (const gtk of dataGtk) {
  //       const id_ptk = gtk.ptk_id;
  //       const id_jabatan = gtk.jabatan_ptk_id; 
  //       const id_jenis_jabatan = gtk.jenis_ptk_id;
  //       const nip = gtk.nip;
  //       const nuptk = gtk.nuptk;
  //       const nama = gtk.nama;


  //       const query = `
  //           INSERT INTO
  //             ptk (
  //               id_ptk, id_jabatan, id_jenis_jabatan, nip, nuptk, nama  
  //             )   
  //             VALUES ($1, $2, $3, $4, $5, $6)
  //             ON CONFLICT (id_ptk) 
  //             DO UPDATE SET
  //               id_jabatan = EXCLUDED.id_jabatan,
  //               id_jenis_jabatan = EXCLUDED.id_jenis_jabatan,
  //               nip = EXCLUDED.nip,
  //               nuptk = EXCLUDED.nuptk,
  //               nama = EXCLUDED.nama
  //             RETURNING *;
  //           `;
  //       const result = await pool.query(query, [
  //         id_ptk,
  //         id_jabatan,
  //         id_jenis_jabatan,
  //         nip,
  //         nuptk,
  //         nama
  //       ]);

  //       results.push(result.rows[0]);
  //     }

  //     res.status(200).json({
  //       message: " Data Berhasil di Import dan di perbaharui",
  //       count: results.length,
  //       data: results,
  //     });
  //   } catch (error) {
  //     console.error("Gagal Import Data", error.message);
  //     res.status(500).json({ error: "Gagal Import Data Dapodik" });
  //   }
  // }
  async importPtk(req, res) {
    // 🎯 Menggunakan pool.connect() agar bisa mengontrol transaction (BEGIN/COMMIT/ROLLBACK)
    const client = await pool.connect(); 
    try {
      const filePath = path.join(__dirname, "../data/getGtk.json");
      const rawData = fs.readFileSync(filePath, "utf-8");
      const dapodikData = JSON.parse(rawData);

      const dataGtk = Array.isArray(dapodikData)
        ? dapodikData
        : dapodikData.rows;

      // 1. Mulai transaksi aman
      await client.query("BEGIN");

      // 2. Siapkan wadah array massal untuk menampung seluruh data GTK
      const arr_id_ptk = [];
      const arr_id_jabatan = [];
      const arr_id_jenis_jabatan = [];
      const arr_nip = [];
      const arr_nuptk = [];
      const arr_nama = [];

      // 3. Masukkan data dari JSON ke dalam array (proses ini di memori Node.js, sangat instan)
      for (const gtk of dataGtk) {
        arr_id_ptk.push(gtk.ptk_id);
        arr_id_jabatan.push(gtk.jabatan_ptk_id || null);
        arr_id_jenis_jabatan.push(gtk.jenis_ptk_id || null);
        arr_nip.push(gtk.nip || null);
        arr_nuptk.push(gtk.nuptk || null);
        arr_nama.push(gtk.nama);
      }

      // 4. Eksekusi 1 query tunggal untuk menyapu bersih ribuan data sekaligus
      // ⚠️ Perhatikan casting tipe data [::uuid[], ::integer[], ::varchar[]] di bawah. 
      // Sesuaikan kembali jika id_jabatan kamu di database bertipe integer atau uuid.
      const queryMassal = `
        INSERT INTO ptk (
          id_ptk, id_jabatan, id_jenis_jabatan, nip, nuptk, nama  
        )   
        SELECT * FROM UNNEST(
          $1::uuid[], 
          $2::integer[], 
          $3::integer[], 
          $4::varchar[], 
          $5::varchar[], 
          $6::varchar[]
        )
        ON CONFLICT (id_ptk) 
        DO UPDATE SET
          id_jabatan = EXCLUDED.id_jabatan,
          id_jenis_jabatan = EXCLUDED.id_jenis_jabatan,
          nip = EXCLUDED.nip,
          nuptk = EXCLUDED.nuptk,
          nama = EXCLUDED.nama
        RETURNING *;
      `;

      const result = await client.query(queryMassal, [
        arr_id_ptk,
        arr_id_jabatan,
        arr_id_jenis_jabatan,
        arr_nip,
        arr_nuptk,
        arr_nama
      ]);

      // 5. Jika sukses total, kunci perubahannya
      await client.query("COMMIT");

      res.status(200).json({
        success: true,
        message: "Data PTK Berhasil di Import dan di perbaharui dengan sistem Bulk Optimization",
        count: result.rows.length
      });

    } catch (error) {
      // 6. Jika ada satu saja data yang rusak/error, batalkan semua agar database tetap steril
      await client.query("ROLLBACK");
      console.error("Gagal Import Data PTK:", error.message);
      res.status(500).json({ error: "Gagal Import Data Dapodik: " + error.message });
    } finally {
      // 7. Selalu kembalikan client ke pool koneksi database
      client.release();
    }
},

  // Import data rombel dari Dapodik
  // async importRombel(req, res) {

  //   const client = await pool.connect();

  //   try {
  //     const filePath = path.join(__dirname, "../data/getRombonganBelajar.json");
  //     const rawData = fs.readFileSync(filePath, "utf-8");
  //     const dapodikData = JSON.parse(rawData);

  //     const dataRombel = Array.isArray(dapodikData)
  //       ? dapodikData
  //       : dapodikData.rows;

  //     const results = [];

  //     await client.query("BEGIN");

  //     for (const rombel of dataRombel) {
  //       const id_rombel = rombel.rombongan_belajar_id;
  //       const nama_rombel = rombel.nama;
  //       const id_tingkat = rombel.tingkat_pendidikan_id;
  //       const nama_tingkat = rombel.tingkat_pendidikan_id_str;
  //       const id_jurusan = rombel.jurusan_id;
  //       const nama_jurusan = rombel.jurusan_id_str;
  //       const id_ptk_wali = rombel.ptk_id;
  //       const id_semester = rombel.semester_id;
  //       const id_anggota_rombel = rombel.anggota_rombel_id;
  //       const id_siswa = rombel.peserta_didik_id;

        
  //       let nama_semester = "";
  //       if (id_semester && id_semester.length === 5) {
  //         const tahunMulai = parseInt(id_semester.substring(0, 4));
  //         const kodeSemester = id_semester.substring(4);
  //         const tahunSelesai = tahunMulai + 1;
  //         const jenisSemester = kodeSemester === "1" ? "Ganjil" : "Genap";
  //         nama_semester = `Semester ${jenisSemester} ${tahunMulai}/${tahunSelesai}`;
  //       } else {
  //         nama_semester = rombel.semester_id || `Semester ${id_semester}`;
  //       }
  //       if (id_tingkat) await client.query(`INSERT INTO tingkat_pendidikan (id_tingkat, nama_tingkat) VALUES ($1, $2) ON CONFLICT (id_tingkat) DO NOTHING;`, [id_tingkat, nama_tingkat]);
  //       if (id_jurusan) await client.query(`INSERT INTO jurusan (id_jurusan, nama_jurusan) VALUES ($1, $2) ON CONFLICT (id_jurusan) DO NOTHING;`, [id_jurusan, nama_jurusan]);
  //       if (id_semester) await client.query(`INSERT INTO semester (id_semester, nama_semester) VALUES ($1, $2) ON CONFLICT (id_semester) DO NOTHING;`, [id_semester, nama_semester]);

  //       const queryRombel = `
  //       INSERT INTO rombel (id_rombel, nama_rombel, id_tingkat, id_jurusan, id_ptk_wali) 
  //       VALUES ($1, $2, $3, $4, $5)
  //       ON CONFLICT (id_rombel) DO UPDATE SET
  //         nama_rombel = EXCLUDED.nama_rombel,
  //         id_tingkat = EXCLUDED.id_tingkat,
  //         id_jurusan = EXCLUDED.id_jurusan,
  //         id_ptk_wali = EXCLUDED.id_ptk_wali
  //       RETURNING *;
  //     `;
      
  //     const resultRombel = await client.query(queryRombel, [id_rombel, nama_rombel, id_tingkat, id_jurusan, id_ptk_wali || null]);
  //     results.push(resultRombel.rows[0]);

  //       if (rombel.anggota_rombel && Array.isArray(rombel.anggota_rombel)&& rombel.anggota_rombel.length > 0 ) {
  //         const id_siswa = rombel.anggota_rombel.map(a => [a.peserta_didik_id]).filter(id => id[0]);
        
  //         if (id_siswa.length > 0) {
  //           await client.query(`
  //           INSERT INTO siswa (id_siswa)
  //           SELECT * FROM UNNEST($1::uuid[])
  //           ON CONFLICT (id_siswa) DO NOTHING;
  //         `, [id_siswa.flat()]);
  //         } 
          
  //       const anggotaValues = [];
  //       for (const anggota of rombel.anggota_belajar || rombel.anggota_rombel) {
  //         if (anggota.anggota_rombel_id && anggota.peserta_didik_id && id_rombel && id_semester) {
  //           anggotaValues.push([
  //             anggota.anggota_rombel_id,
  //             id_rombel,
  //             anggota.peserta_didik_id,
  //             id_semester
  //           ]);
  //         }
  //       }

  //       if (anggotaValues.length > 0) {

  //         await client.query(`
  //           INSERT INTO anggota_rombel (id_anggota_rombel, id_rombel, id_siswa, id_semester)
  //           SELECT * FROM UNNEST($1::uuid[], $2::uuid[], $3::uuid[], $4::integer[])
  //           ON CONFLICT (id_siswa, id_semester) 
  //           DO UPDATE SET
  //             id_anggota_rombel = EXCLUDED.id_anggota_rombel,
  //             id_rombel = EXCLUDED.id_rombel;
  //         `, 
  //         [
  //           anggotaValues.map(v => v[0]),
  //           anggotaValues.map(v => v[1]),
  //           anggotaValues.map(v => v[2]),
  //           anggotaValues.map(v => v[3])
  //         ]);
  //       }
  //     }
  //   }

  //     await client.query("COMMIT");

  //     res.status(200).json({
  //       message: " Data Berhasil di Import ",
  //       count: results.length,
  //       data: results,
  //     });
  //   } catch (error) {
  //     await client.query("ROLLBACK");
  //     console.error("Gagal Import Data", error.message);
  //     res.status(500).json({ error: "Gagal Import Data Dapodik: " + error.message });
  //   } finally {
  //     client.release();
  //   }
  // }
  
  async importRombel(req, res) {
    const client = await pool.connect();

    try {
      const filePath = path.join(__dirname, "../data/getRombonganBelajar.json");
      const rawData = fs.readFileSync(filePath, "utf-8");
      const dapodikData = JSON.parse(rawData);

      const dataRombelRaw = Array.isArray(dapodikData)
        ? dapodikData
        : dapodikData.rows;

      const dataRombel = dataRombelRaw.filter(rombel => Number(rombel.jenis_rombel) === 1);

      await client.query("BEGIN");

      // 1. Siapkan Set untuk menampung Master Data Unik
      const tingkatSet = new Map();
      const jurusanSet = new Map();
      const semesterSet = new Map();

      // 2. Siapkan Array Penampung untuk Bulk Insert Rombel
      const bulkRombel = { id: [], nama: [], tingkat: [], jurusan: [], wali: [] };
      const rombelTerprosesSet = new Set(); 

      // 3. Siapkan Array Penampung untuk Bulk Insert Siswa Dummy
      const bulkSiswaSet = new Set();

      // 4. Siapkan Array Penampung untuk Bulk Insert Anggota Rombel
      const bulkAnggota = { id: [], rombel: [], siswa: [], semester: [] };
      
      // 🎯 PERBAIKAN KUNCI: Kita saring berdasarkan kombinasi siswa + semester sesuai aturan ON CONFLICT database
      const siswaSemesterTerprosesSet = new Set(); 

      // =================================================================
      // LANGKAH A: Ekstraksi Seluruh Data ke dalam Memori Node.js
      // =================================================================
      for (const rombel of dataRombel) {
        const id_rombel = rombel.rombongan_belajar_id;
        if (!id_rombel) continue; 

        const nama_rombel = rombel.nama;
        const id_tingkat = rombel.tingkat_pendidikan_id;
        const nama_tingkat = rombel.tingkat_pendidikan_id_str;
        const id_jurusan = rombel.jurusan_id;
        const nama_jurusan = rombel.jurusan_id_str;
        const id_ptk_wali = rombel.ptk_id || null;
        const id_semester = rombel.semester_id;

        // Hitung nama semester dinamis
        let nama_semester = "";
        if (id_semester && id_semester.length === 5) {
          const tahunMulai = parseInt(id_semester.substring(0, 4));
          nama_semester = `Semester ${id_semester.substring(4) === "1" ? "Ganjil" : "Genap"} ${tahunMulai}/${tahunMulai + 1}`;
        } else {
          nama_semester = id_semester ? `Semester ${id_semester}` : "";
        }

        if (id_tingkat) tingkatSet.set(id_tingkat, nama_tingkat);
        if (id_jurusan) jurusanSet.set(id_jurusan, nama_jurusan);
        if (id_semester) semesterSet.set(id_semester, nama_semester);

        // Filter Rombel unik (Berdasarkan ID Rombel)
        if (!rombelTerprosesSet.has(id_rombel)) {
          rombelTerprosesSet.add(id_rombel);
          
          bulkRombel.id.push(id_rombel);
          bulkRombel.nama.push(nama_rombel);
          bulkRombel.tingkat.push(id_tingkat);
          bulkRombel.jurusan.push(id_jurusan);
          bulkRombel.wali.push(id_ptk_wali);
        }

        // Ekstraksi data Anggota Rombel & Siswa
        const listAnggota = rombel.anggota_belajar || rombel.anggota_rombel;
        if (listAnggota && Array.isArray(listAnggota)) {
          for (const anggota of listAnggota) {
            if (anggota.anggota_rombel_id && anggota.peserta_didik_id && id_rombel && id_semester) {
              
              // 🎯 KUNCI UTAMA: Buat unique key gabungan antara id_siswa dan id_semester
              const siswaSemesterKey = `${anggota.peserta_didik_id}_${id_semester}`;

              // Jika kombinasi siswa ini di semester ini belum pernah dimasukkan ke list bulk
              if (!siswaSemesterTerprosesSet.has(siswaSemesterKey)) {
                siswaSemesterTerprosesSet.add(siswaSemesterKey); // Kunci agar tidak masuk dua kali

                bulkSiswaSet.add(anggota.peserta_didik_id);

                bulkAnggota.id.push(anggota.anggota_rombel_id);
                bulkAnggota.rombel.push(id_rombel);
                bulkAnggota.siswa.push(anggota.peserta_didik_id);
                bulkAnggota.semester.push(parseInt(id_semester));
              }
            }
          }
        }
      }

      // =================================================================
      // LANGKAH B: Eksekusi Query Bulk Secara Berurutan (Hanya 1 Query per Tabel)
      // =================================================================

      // 1. Bulk Insert Tingkat Pendidikan
      if (tingkatSet.size > 0) {
        await client.query(
          `INSERT INTO tingkat_pendidikan (id_tingkat, nama_tingkat) 
           SELECT * FROM UNNEST($1::integer[], $2::varchar[]) ON CONFLICT (id_tingkat) DO NOTHING;`,
          [[...tingkatSet.keys()], [...tingkatSet.values()]]
        );
      }

      // 2. Bulk Insert Jurusan
      if (jurusanSet.size > 0) {
        await client.query(
          `INSERT INTO jurusan (id_jurusan, nama_jurusan) 
           SELECT * FROM UNNEST($1::integer[], $2::varchar[]) ON CONFLICT (id_jurusan) DO NOTHING;`,
          [[...jurusanSet.keys()], [...jurusanSet.values()]]
        );
      }

      // 3. Bulk Insert Semester
      if (semesterSet.size > 0) {
        await client.query(
          `INSERT INTO semester (id_semester, nama_semester) 
           SELECT * FROM UNNEST($1::integer[], $2::varchar[]) ON CONFLICT (id_semester) DO NOTHING;`,
          [[...semesterSet.keys()], [...semesterSet.values()]]
        );
      }

      // 4. Bulk Insert Rombel (Menggunakan Master Koneksi)
      let totalRombelImported = 0;
      if (bulkRombel.id.length > 0) {
        const resRombel = await client.query(
          `INSERT INTO rombel (id_rombel, nama_rombel, id_tingkat, id_jurusan, id_ptk_wali)
           SELECT * FROM UNNEST($1::uuid[], $2::varchar[], $3::integer[], $4::integer[], $5::uuid[])
           ON CONFLICT (id_rombel) DO UPDATE SET
             nama_rombel = EXCLUDED.nama_rombel,
             id_tingkat = EXCLUDED.id_tingkat,
             id_jurusan = EXCLUDED.id_jurusan,
             id_ptk_wali = EXCLUDED.id_ptk_wali
           RETURNING *;`,
          [bulkRombel.id, bulkRombel.nama, bulkRombel.tingkat, bulkRombel.jurusan, bulkRombel.wali]
        );
        totalRombelImported = resRombel.rows.length;
      }

      // 5. Bulk Insert Siswa Dummy (Mencegah Foreign Key Violation sebelum importSiswa dijalankan)
      if (bulkSiswaSet.size > 0) {
        await client.query(
          `INSERT INTO siswa (id_siswa) 
           SELECT * FROM UNNEST($1::uuid[]) ON CONFLICT (id_siswa) DO NOTHING;`,
          [[...bulkSiswaSet]]
        );
      }

      // 6. Bulk Insert Anggota Rombel (Gunakan composite constraint unik yang dipasang sebelumnya)
      if (bulkAnggota.id.length > 0) {
        await client.query(
          `INSERT INTO anggota_rombel (id_anggota_rombel, id_rombel, id_siswa, id_semester)
           SELECT * FROM UNNEST($1::uuid[], $2::uuid[], $3::uuid[], $4::integer[])
           ON CONFLICT (id_siswa, id_semester) DO UPDATE SET
             id_anggota_rombel = EXCLUDED.id_anggota_rombel,
             id_rombel = EXCLUDED.id_rombel;`,
          [bulkAnggota.id, bulkAnggota.rombel, bulkAnggota.siswa, bulkAnggota.semester]
        );
      }

      // Jika seluruh tahapan sukses tanpa interupsi, Commit semua perubahan
      await client.query("COMMIT");

      res.status(200).json({
        success: true,
        message: "Data Rombongan Belajar & Anggota Kelas Berhasil di-Import massal (Optimasi Bulk)",
        count: totalRombelImported
      });

    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Gagal Import Data Rombel:", error.message);
      res.status(500).json({ error: "Gagal Import Data Dapodik: " + error.message });
    } finally {
      client.release();
    }
},

  // Import data siswa dari Dapodik
  // async importSiswa(req, res) {
  //   const client = await pool.connect();
  //   try {
  //     const filePath = path.join(__dirname, "../data/getPesertaDidik.json");
  //     const rawData = fs.readFileSync(filePath, "utf-8");
  //     const dapodikData = JSON.parse(rawData);

  //     const dataSiswa = Array.isArray(dapodikData) ? dapodikData : dapodikData.rows;
      
  //     const results = [];

  //     const ortuCacheMap = {};

  //     await client.query("BEGIN");

  //     for (const siswa of dataSiswa) {
  //       const id_siswa = siswa.peserta_didik_id;
  //       const id_agama = siswa.agama_id;
  //       const nisn = siswa.nisn;
  //       const nipd = siswa.nipd;
  //       const nama = siswa.nama;
  //       const tempat_lahir = siswa.tempat_lahir;
  //       const tanggal_lahir = siswa.tanggal_lahir;
  //       const email = siswa.email;

  //       const nama_ayah = siswa.nama_ayah ? siswa.nama_ayah.trim() : "";
  //       const nama_ibu = siswa.nama_ibu ? siswa.nama_ibu.trim() : "";
  //       const nama_wali = siswa.nama_wali ? siswa.nama_wali.trim() : "";

  //       const ortuKey = `${nama_ayah}|${nama_ibu}|${nama_wali}`.toLowerCase();

  //       let id_orangtua = null;

  //       if (!ortuCacheMap[ortuKey]) {
          
  //         const cekDb = await client.query(
  //           `SELECT id_orangtua FROM orangtua_wali WHERE 
  //            LOWER(nama_ayah) = $1 AND loWER(nama_ibu) = $2 AND LOWER(nama_wali) = $3`,
  //           [nama_ayah.toLowerCase(), nama_ibu.toLowerCase(), nama_wali.toLowerCase()]
  //         );
  //         if (cekDb.rows.length > 0) {
  //           id_orangtua = cekDb.rows[0].id_orangtua;
  //         } else {
  //           const insertOrtu = await client.query(
  //             `INSERT INTO orangtua_wali (nama_ayah, nama_ibu, nama_wali)
  //              VALUES ($1, $2, $3) RETURNING id_orangtua`,
  //             [nama_ayah, nama_ibu, nama_wali]
  //           );
  //           id_orangtua = insertOrtu.rows[0].id_orangtua;
  //         }
  //         ortuCacheMap[ortuKey] = id_orangtua;
  //       } else {
  //         id_orangtua = ortuCacheMap[ortuKey];
  //       }

  //       const querySiswa = `
  //             INSERT INTO siswa (
  //               id_siswa, id_orangtua, id_agama, nipd, nisn, nama, tempat_lahir,
  //               tanggal_lahir, email
  //               ) 
  //               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  //               ON CONFLICT (id_siswa) DO UPDATE SET
  //                 id_orangtua = EXCLUDED.id_orangtua,
  //                 id_agama = EXCLUDED.id_agama,
  //                 nipd = EXCLUDED.nipd,
  //                 nisn = EXCLUDED.nisn,
  //                 nama = EXCLUDED.nama,
  //                 tempat_lahir = EXCLUDED.tempat_lahir,
  //                 tanggal_lahir = EXCLUDED.tanggal_lahir,
  //                 email = EXCLUDED.email
  //             RETURNING *;
  //           `;

  //       const resultSiswa = await client.query(querySiswa, [
  //         id_siswa, 
  //         id_orangtua,
  //         id_agama,
  //         nipd,
  //         nisn,
  //         nama,
  //         tempat_lahir,
  //         tanggal_lahir,
  //         email
  //       ]);

  //       results.push(resultSiswa.rows[0]);
  //     }

  //     await client.query("COMMIT");

  //     res.status(200).json({
  //       message: "Data Berhasil di Import dan di perbaharui",
  //       count: results.length,
  //       data: results,
  //     });
  //   } catch (error) {
  //     await client.query("ROLLBACK");
  //     console.error("Gagal Import Data", error.message);
  //     res.status(500).json({ error: "Gagal Import Data Dapodik" });
  //   } finally {
  //     client.release();
  //   }
  // }
    async importSiswa(req, res) {
      const client = await pool.connect();
      try {
        const filePath = path.join(__dirname, "../data/getPesertaDidik.json");
        const rawData = fs.readFileSync(filePath, "utf-8");
        const dapodikData = JSON.parse(rawData);

        const dataSiswa = Array.isArray(dapodikData) ? dapodikData : dapodikData.rows;
        
        await client.query("BEGIN");

        // -----------------------------------------------------------------
        // LANGKAH 1: Ambil semua data orang tua yang ada saat ini untuk caching massal
        // -----------------------------------------------------------------
        const semuaOrtu = await client.query("SELECT id_orangtua, nama_ayah, nama_ibu, nama_wali FROM orangtua_wali");
        const ortuCacheMap = {};
        
        semuaOrtu.rows.forEach(row => {
          const k = `${row.nama_ayah || ''}|${row.nama_ibu || ''}|${row.nama_wali || ''}`.toLowerCase().trim();
          ortuCacheMap[k] = row.id_orangtua;
        });

        // -----------------------------------------------------------------
        // LANGKAH 2: Deteksi & Kumpulkan Orang Tua Baru yang Belum Ada di DB
        // -----------------------------------------------------------------
        const ortuBaru_Ayah = [];
        const ortuBaru_Ibu = [];
        const ortuBaru_Wali = [];
        const ortuBaru_NoTelp = [];
        const ortuBaru_NoTelpRumah = [];
        const ortuBaruSet = new Set(); // Mencegah duplikasi ortu baru di dalam file JSON itu sendiri

        for (const siswa of dataSiswa) {
          const nama_ayah = siswa.nama_ayah ? siswa.nama_ayah.trim() : "";
          const nama_ibu = siswa.nama_ibu ? siswa.nama_ibu.trim() : "";
          const nama_wali = siswa.nama_wali ? siswa.nama_wali.trim() : "";
          const ortuKey = `${nama_ayah}|${nama_ibu}|${nama_wali}`.toLowerCase();

          const hpOrtu = siswa.nomor_telepon_seluler ? String(siswa.nomor_telepon_seluler).trim() : null;
          const tlpRumahOrtu = siswa.nomor_telepon_rumah ? String(siswa.nomor_telepon_rumah).trim() : null;

          if (!ortuCacheMap[ortuKey] && !ortuBaruSet.has(ortuKey)) {
            ortuBaruSet.add(ortuKey);
            ortuBaru_Ayah.push(nama_ayah);
            ortuBaru_Ibu.push(nama_ibu);
            ortuBaru_Wali.push(nama_wali);
            ortuBaru_NoTelp.push(hpOrtu);
            ortuBaru_NoTelpRumah.push(tlpRumahOrtu);
          }
        }

        // Jika ada orang tua baru, insert sekaligus dalam 1 query massal
        if (ortuBaru_Ayah.length > 0) {
          const insertOrtuMassal = await client.query(
            `INSERT INTO orangtua_wali (nama_ayah, nama_ibu, nama_wali, no_telp, no_telp_rumah)
            SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::varchar[], $5::varchar[])
            ON CONFLICT DO NOTHING
            RETURNING id_orangtua, nama_ayah, nama_ibu, nama_wali`,
            [ortuBaru_Ayah, ortuBaru_Ibu, ortuBaru_Wali, ortuBaru_NoTelp, ortuBaru_NoTelpRumah]
          );

          // Masukkan data orang tua yang baru di-insert ke dalam cache
          insertOrtuMassal.rows.forEach(row => {
            const k = `${row.nama_ayah || ''}|${row.nama_ibu || ''}|${row.nama_wali || ''}`.toLowerCase().trim();
            ortuCacheMap[k] = row.id_orangtua;
          });
        }

        // -----------------------------------------------------------------
        // LANGKAH 3: Siapkan Array Massal untuk Bulk Insert Data Siswa
        // -----------------------------------------------------------------
        const arr_id_siswa = [];
        const arr_id_orangtua = [];
        const arr_id_agama = [];
        const arr_nipd = [];
        const arr_nisn = [];
        const arr_nama = [];
        const arr_tempat_lahir = [];
        const arr_tanggal_lahir = [];
        const arr_email = [];
        const arr_no_telp=[];

        for (const siswa of dataSiswa) {
          const nama_ayah = siswa.nama_ayah ? siswa.nama_ayah.trim() : "";
          const nama_ibu = siswa.nama_ibu ? siswa.nama_ibu.trim() : "";
          const nama_wali = siswa.nama_wali ? siswa.nama_wali.trim() : "";
          const ortuKey = `${nama_ayah}|${nama_ibu}|${nama_wali}`.toLowerCase();
          
          const id_orangtua = ortuCacheMap[ortuKey] || null;

          const rawPhone = siswa.nomor_telepon_rumah || siswa.nomor_telepon_seluler;
          const no_telp = rawPhone ? String(rawPhone).trim() : null;

          let emailSiswa = siswa.email ? siswa.email.trim() : "";
          if (!emailSiswa && siswa.nisn) {
            emailSiswa = `${siswa.nisn.trim()}@sipps`;
          } else if (!emailSiswa) {
            emailSiswa = null;
          }
          
          arr_id_siswa.push(siswa.peserta_didik_id);
          arr_id_orangtua.push(id_orangtua);
          arr_id_agama.push(siswa.agama_id || null);
          arr_nipd.push(siswa.nipd || null);
          arr_nisn.push(siswa.nisn || null);
          arr_nama.push(siswa.nama);
          arr_tempat_lahir.push(siswa.tempat_lahir || null);
          arr_tanggal_lahir.push(siswa.tanggal_lahir || null);
          arr_email.push(emailSiswa || null);
          arr_no_telp.push(no_telp);
        }

        // -----------------------------------------------------------------
        // LANGKAH 4: Eksekusi 1 Query Tunggal untuk Ribuan Data Siswa
        // -----------------------------------------------------------------
        const querySiswaMassal = `
          INSERT INTO siswa (
            id_siswa, id_orangtua, id_agama, nipd, nisn, nama, tempat_lahir, tanggal_lahir, no_telp, email
          )
          SELECT * FROM UNNEST(
            $1::uuid[], $2::uuid[], $3::integer[], $4::varchar[], $5::varchar[], $6::varchar[], $7::varchar[], $8::date[], $9::varchar[], $10::varchar[]
          )
          ON CONFLICT (id_siswa) DO UPDATE SET
            id_orangtua = EXCLUDED.id_orangtua,
            id_agama = EXCLUDED.id_agama,
            nipd = EXCLUDED.nipd,
            nisn = EXCLUDED.nisn,
            nama = EXCLUDED.nama,
            tempat_lahir = EXCLUDED.tempat_lahir,
            tanggal_lahir = EXCLUDED.tanggal_lahir,
            no_telp = EXCLUDED.no_telp,
            email = EXCLUDED.email
          RETURNING *;
        `;

        const resultSiswa = await client.query(querySiswaMassal, [
          arr_id_siswa, arr_id_orangtua, arr_id_agama, arr_nipd, arr_nisn, arr_nama, arr_tempat_lahir, arr_tanggal_lahir, arr_no_telp, arr_email
        ]);

        await client.query("COMMIT");

        res.status(200).json({
          success: true,
          message: "Data Dapodik Berhasil di Import",
          count: resultSiswa.rows.length
        });

      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Gagal Import Data:", error);
        res.status(500).json({ error: "Gagal Import Data Dapodik: " + error.message });
      } finally {
        client.release();
      }
  }
  ,

  // async importPengguna(req, res) {

  //   let client;

  //   try {
  //     const filePath = path.join(__dirname, "../data/getPengguna.json");
  //     const rawData = fs.readFileSync(filePath, "utf-8");
  //     const dapodikData = JSON.parse(rawData);

  //     const dataPengguna = Array.isArray(dapodikData) ? dapodikData : dapodikData.rows;

  //     const uniqueSiswa = new Map();
  //     const uniquePtk = new Map();

  //     for (const pengguna of dataPengguna) {
  //       if (
  //         pengguna.peserta_didik_id &&
  //         !uniqueSiswa.has(pengguna.peserta_didik_id)
  //       ) {
  //         uniqueSiswa.set(pengguna.peserta_didik_id, pengguna);
  //       }
  //       if (pengguna.ptk_id && !uniquePtk.has(pengguna.ptk_id)) {
  //         uniquePtk.set(pengguna.ptk_id, pengguna);
  //       }
  //     }

  //     client = await pool.connect();

  //     await client.query("BEGIN");

  //     let totalSiswaUpdated = 0;
  //     let totalPtkUpdated = 0;

  //     // update siswa
  //     for (const pengguna of uniqueSiswa.values()) {
  //       const querySiswa = `
  //               INSERT INTO siswa (id_siswa, alamat, no_telp, email)
  //               VALUES ($1, $2, $3, $4)
  //               ON CONFLICT (id_siswa) DO UPDATE SET
  //               alamat = EXCLUDED.alamat,
  //               no_telp = EXCLUDED.no_telp,
  //               email = EXCLUDED.email
  //         RETURNING *;
  //         `;

  //       const email = pengguna.username ? pengguna.username.trim() : null;
  //       const alamat = pengguna.alamat ? pengguna.alamat.trim() : null;
  //       const nomor_hp = pengguna.no_hp || pengguna.no_telp ;
  //       const no_telp = pengguna.nomor_hp ? String(nomor_hp).trim() : null;
        
  //       const resultSiswa = await client.query(querySiswa, [
  //         pengguna.peserta_didik_id,
  //         alamat,
  //         no_telp,
  //         email
  //       ]);
  //       totalSiswaUpdated += resultSiswa.rowCount;
  //     }

  //     // === UPDATE PTK ===
  //     for (const pengguna of uniquePtk.values()) {
  //       const queryPtk = `
  //                 INSERT INTO ptk (id_ptk, no_telp, email)
  //                 VALUES ($1, $2, $3)
  //                 ON CONFLICT (id_ptk) DO UPDATE SET
  //                 email = EXCLUDED.email,
  //                 no_telp = EXCLUDED.no_telp
  //         RETURNING *;
  //               `;

  //       const email = pengguna.username ? pengguna.username.trim() : null;
  //       const nomor_hp = pengguna.no_hp || pengguna.no_telp ;
  //       const no_telp = pengguna.no_hp ? String(pengguna.no_hp).trim() : null;
        
  //       const resultPtk = await client.query(queryPtk, [
  //         pengguna.ptk_id,
  //         no_telp,
  //         email
  //       ]);
  //       totalPtkUpdated += resultPtk.rowCount;
  //     }

  //     await client.query("COMMIT");

  //     res.json({
  //       message: "Data siswa & ptk berhasil diupdate",
  //       updated: {
  //         siswa: totalSiswaUpdated,
  //         ptk: totalPtkUpdated,
  //       },
  //     });
  //   } catch (err) {
  //     if (client) await client.query("ROLLBACK");
  //     console.error("Error update data:", err);
  //     res.status(500).json({ success: false, error: err.message });
  //   } finally {
  //     if (client) client.release();
  //   }
  // }
  
  async importPengguna(req, res) {
    let client;

    try {
      const filePath = path.join(__dirname, "../data/getPengguna.json");
      const rawData = fs.readFileSync(filePath, "utf-8");
      const dapodikData = JSON.parse(rawData);

      const dataPengguna = Array.isArray(dapodikData) ? dapodikData : dapodikData.rows;

      // 1. Manfaatkan Map untuk menjamin keunikan ID di memori Node.js
      const uniqueSiswa = new Map();
      const uniquePtk = new Map();

      for (const pengguna of dataPengguna) {
        if (pengguna.peserta_didik_id && !uniqueSiswa.has(pengguna.peserta_didik_id)) {
          uniqueSiswa.set(pengguna.peserta_didik_id, pengguna);
        }
        if (pengguna.ptk_id && !uniquePtk.has(pengguna.ptk_id)) {
          uniquePtk.set(pengguna.ptk_id, pengguna);
        }
      }

      client = await pool.connect();
      await client.query("BEGIN");

      let totalSiswaUpdated = 0;
      let totalPtkUpdated = 0;

      // =================================================================
      // TAHAP 1: OPTIMASI BULK UPDATE SISWA (Hanya 1 Query Massal)
      // =================================================================
      if (uniqueSiswa.size > 0) {
        const bulkSiswa = { id: [], alamat: [], no_telp: [], email: [] };

        for (const pengguna of uniqueSiswa.values()) {
          const email = pengguna.username ? pengguna.username.trim() : null;
          const alamat = pengguna.alamat ? pengguna.alamat.trim() : null;
          
          // Memperbaiki bug typo deteksi nomor hp dari dapodik
          const nomorRaw = pengguna.no_hp || pengguna.no_telp || pengguna.nomor_hp;
          const no_telp = nomorRaw ? String(nomorRaw).trim() : null;

          bulkSiswa.id.push(pengguna.peserta_didik_id);
          bulkSiswa.alamat.push(alamat);
          bulkSiswa.no_telp.push(no_telp);
          bulkSiswa.email.push(email);
        }

        const resSiswa = await client.query(
          `INSERT INTO siswa (id_siswa, alamat, no_telp, email)
           SELECT * FROM UNNEST($1::uuid[], $2::varchar[], $3::varchar[], $4::varchar[])
           ON CONFLICT (id_siswa) DO UPDATE SET
             alamat = EXCLUDED.alamat,
             no_telp = EXCLUDED.no_telp,
             email = EXCLUDED.email
           RETURNING *;`,
          [bulkSiswa.id, bulkSiswa.alamat, bulkSiswa.no_telp, bulkSiswa.email]
        );
        totalSiswaUpdated = resSiswa.rows.length;
      }

      // =================================================================
      // TAHAP 2: OPTIMASI BULK UPDATE PTK (Hanya 1 Query Massal)
      // =================================================================
      if (uniquePtk.size > 0) {
        const bulkPtk = { id: [], no_telp: [], email: [] };

        for (const pengguna of uniquePtk.values()) {
          const email = pengguna.username ? pengguna.username.trim() : null;
          
          // Konsistensi deteksi nomor hp untuk GTK/PTK
          const nomorRaw = pengguna.no_hp || pengguna.no_telp || pengguna.nomor_hp;
          const no_telp = nomorRaw ? String(nomorRaw).trim() : null;

          bulkPtk.id.push(pengguna.ptk_id);
          bulkPtk.no_telp.push(no_telp);
          bulkPtk.email.push(email);
        }

        const resPtk = await client.query(
          `INSERT INTO ptk (id_ptk, no_telp, email)
           SELECT * FROM UNNEST($1::uuid[], $2::varchar[], $3::varchar[])
           ON CONFLICT (id_ptk) DO UPDATE SET
             email = EXCLUDED.email,
             no_telp = EXCLUDED.no_telp
           RETURNING *;`,
          [bulkPtk.id, bulkPtk.no_telp, bulkPtk.email]
        );
        totalPtkUpdated = resPtk.rows.length;
      }

      // Jika kedua query massal berhasil, kunci perubahan data
      await client.query("COMMIT");

      res.json({
        success: true,
        message: "Data akun pengguna Siswa & PTK berhasil diperbaharui (Bulk Optimization)",
        updated: {
          siswa: totalSiswaUpdated,
          ptk: totalPtkUpdated,
        },
      });

    } catch (err) {
      if (client) await client.query("ROLLBACK");
      console.error("Error update data pengguna:", err.message);
      res.status(500).json({ success: false, error: "Gagal Sinkronisasi Pengguna: " + err.message });
    } finally {
      if (client) client.release();
    }
},
};
