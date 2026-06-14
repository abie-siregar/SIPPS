const { count } = require("console");
const pool = require("../../config/database");
const fs = require("fs");
const path = require("path");

module.exports = {

  // Import Data PTK dari Dapodik getGtk.json
  async importPtk(req, res) {
    try {
      const filePath = path.join(__dirname, "../data/getGtk.json");
      const rawData = fs.readFileSync(filePath, "utf-8");
      const dapodikData = JSON.parse(rawData);

      const dataGtk = Array.isArray(dapodikData)
        ? dapodikData
        : dapodikData.rows;

      const results = [];

      for (const gtk of dataGtk) {
        const id_ptk = gtk.ptk_id;
        const id_jabatan = gtk.jabatan_ptk_id; 
        const id_jenis_jabatan = gtk.jenis_ptk_id;
        const nip = gtk.nip;
        const nuptk = gtk.nuptk;
        const nama = gtk.nama;


        const query = `
            INSERT INTO
              ptk (
                id_ptk, id_jabatan, id_jenis_jabatan, nip, nuptk, nama  
              )   
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (id_ptk) 
              DO UPDATE SET
                id_jabatan = EXCLUDED.id_jabatan,
                id_jenis_jabatan = EXCLUDED.id_jenis_jabatan,
                nip = EXCLUDED.nip,
                nuptk = EXCLUDED.nuptk,
                nama = EXCLUDED.nama
              RETURNING *;
            `;
        const result = await pool.query(query, [
          id_ptk,
          id_jabatan,
          id_jenis_jabatan,
          nip,
          nuptk,
          nama
        ]);

        results.push(result.rows[0]);
      }

      res.status(200).json({
        message: " Data Berhasil di Import dan di perbaharui",
        count: results.length,
        data: results,
      });
    } catch (error) {
      console.error("Gagal Import Data", error.message);
      res.status(500).json({ error: "Gagal Import Data Dapodik" });
    }
  },

  // Import data rombel dari Dapodik
  async importRombel(req, res) {

    const client = await pool.connect();

    try {
      const filePath = path.join(__dirname, "../data/getRombonganBelajar.json");
      const rawData = fs.readFileSync(filePath, "utf-8");
      const dapodikData = JSON.parse(rawData);

      const dataRombel = Array.isArray(dapodikData)
        ? dapodikData
        : dapodikData.rows;

      const results = [];

      await client.query("BEGIN");

      for (const rombel of dataRombel) {
        const id_rombel = rombel.rombongan_belajar_id;
        const nama_rombel = rombel.nama;
        const id_tingkat = rombel.tingkat_pendidikan_id;
        const nama_tingkat = rombel.tingkat_pendidikan_id_str;
        const id_jurusan = rombel.jurusan_id;
        const nama_jurusan = rombel.jurusan_id_str;
        const id_ptk_wali = rombel.ptk_id;
        const id_semester = rombel.semester_id;
        const id_anggota_rombel = rombel.anggota_rombel_id;
        const id_siswa = rombel.peserta_didik_id;

        
        let nama_semester = "";
        if (id_semester && id_semester.length === 5) {
          const tahunMulai = parseInt(id_semester.substring(0, 4));
          const kodeSemester = id_semester.substring(4);
          const tahunSelesai = tahunMulai + 1;
          const jenisSemester = kodeSemester === "1" ? "Ganjil" : "Genap";
          nama_semester = `Semester ${jenisSemester} ${tahunMulai}/${tahunSelesai}`;
        } else {
          nama_semester = rombel.semester_id || `Semester ${id_semester}`;
        }
        if (id_tingkat) await client.query(`INSERT INTO tingkat_pendidikan (id_tingkat, nama_tingkat) VALUES ($1, $2) ON CONFLICT (id_tingkat) DO NOTHING;`, [id_tingkat, nama_tingkat]);
        if (id_jurusan) await client.query(`INSERT INTO jurusan (id_jurusan, nama_jurusan) VALUES ($1, $2) ON CONFLICT (id_jurusan) DO NOTHING;`, [id_jurusan, nama_jurusan]);
        if (id_semester) await client.query(`INSERT INTO semester (id_semester, nama_semester) VALUES ($1, $2) ON CONFLICT (id_semester) DO NOTHING;`, [id_semester, nama_semester]);

        const queryRombel = `
        INSERT INTO rombel (id_rombel, nama_rombel, id_tingkat, id_jurusan, id_ptk_wali) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id_rombel) DO UPDATE SET
          nama_rombel = EXCLUDED.nama_rombel,
          id_tingkat = EXCLUDED.id_tingkat,
          id_jurusan = EXCLUDED.id_jurusan,
          id_ptk_wali = EXCLUDED.id_ptk_wali
        RETURNING *;
      `;
      
      const resultRombel = await client.query(queryRombel, [id_rombel, nama_rombel, id_tingkat, id_jurusan, id_ptk_wali || null]);
      results.push(resultRombel.rows[0]);

        if (rombel.anggota_rombel && Array.isArray(rombel.anggota_rombel)&& rombel.anggota_rombel.length > 0 ) {
          const id_siswa = rombel.anggota_rombel.map(a => [a.peserta_didik_id]).filter(id => id[0]);
        
          if (id_siswa.length > 0) {
            await client.query(`
            INSERT INTO siswa (id_siswa)
            SELECT * FROM UNNEST($1::uuid[])
            ON CONFLICT (id_siswa) DO NOTHING;
          `, [id_siswa.flat()]);
          } 
          
        const anggotaValues = [];
        for (const anggota of rombel.anggota_belajar || rombel.anggota_rombel) {
          if (anggota.anggota_rombel_id && anggota.peserta_didik_id && id_rombel && id_semester) {
            anggotaValues.push([
              anggota.anggota_rombel_id,
              id_rombel,
              anggota.peserta_didik_id,
              id_semester
            ]);
          }
        }

        if (anggotaValues.length > 0) {
          await client.query(`
            INSERT INTO anggota_rombel (id_anggota_rombel, id_rombel, id_siswa, id_semester)
            SELECT * FROM UNNEST($1::uuid[], $2::uuid[], $3::uuid[], $4::varchar[])
            ON CONFLICT (id_siswa, id_semester) 
            DO UPDATE SET
              id_anggota_rombel = EXCLUDED.id_anggota_rombel,
              id_rombel = EXCLUDED.id_rombel;
          `, [
            anggotaValues.map(v => v[0]),
            anggotaValues.map(v => v[1]),
            anggotaValues.map(v => v[2]),
            anggotaValues.map(v => v[3])
          ]);
        }
      }
    }

      await client.query("COMMIT");

      res.status(200).json({
        message: " Data Berhasil di Import ",
        count: results.length,
        data: results,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Gagal Import Data", error.message);
      res.status(500).json({ error: "Gagal Import Data Dapodik: " + error.message });
    } finally {
      client.release();
    }
  },

  // Import data siswa dari Dapodik
  async importSiswa(req, res) {
    const client = await pool.connect();
    try {
      const filePath = path.join(__dirname, "../data/getPesertaDidik.json");
      const rawData = fs.readFileSync(filePath, "utf-8");
      const dapodikData = JSON.parse(rawData);

      const dataSiswa = Array.isArray(dapodikData) ? dapodikData : dapodikData.rows;
      
      const results = [];

      const ortuCacheMap = {};

      await client.query("BEGIN");

      for (const siswa of dataSiswa) {
        const id_siswa = siswa.peserta_didik_id;
        const id_agama = siswa.agama_id;
        const nisn = siswa.nisn;
        const nipd = siswa.nipd;
        const nama = siswa.nama;
        const tempat_lahir = siswa.tempat_lahir;
        const tanggal_lahir = siswa.tanggal_lahir;
        const email = siswa.email;

        const nama_ayah = siswa.nama_ayah ? siswa.nama_ayah.trim() : "";
        const nama_ibu = siswa.nama_ibu ? siswa.nama_ibu.trim() : "";
        const nama_wali = siswa.nama_wali ? siswa.nama_wali.trim() : "";

        const ortuKey = `${nama_ayah}|${nama_ibu}|${nama_wali}`.toLowerCase();

        let id_orangtua = null;

        if (!ortuCacheMap[ortuKey]) {
          
          const cekDb = await client.query(
            `SELECT id_orangtua FROM orangtua_wali WHERE 
             LOWER(nama_ayah) = $1 AND loWER(nama_ibu) = $2 AND LOWER(nama_wali) = $3`,
            [nama_ayah.toLowerCase(), nama_ibu.toLowerCase(), nama_wali.toLowerCase()]
          );
          if (cekDb.rows.length > 0) {
            id_orangtua = cekDb.rows[0].id_orangtua;
          } else {
            const insertOrtu = await client.query(
              `INSERT INTO orangtua_wali (nama_ayah, nama_ibu, nama_wali)
               VALUES ($1, $2, $3) RETURNING id_orangtua`,
              [nama_ayah, nama_ibu, nama_wali]
            );
            id_orangtua = insertOrtu.rows[0].id_orangtua;
          }
          ortuCacheMap[ortuKey] = id_orangtua;
        } else {
          id_orangtua = ortuCacheMap[ortuKey];
        }

        const querySiswa = `
              INSERT INTO siswa (
                id_siswa, id_orangtua, id_agama, nipd, nisn, nama, tempat_lahir,
                tanggal_lahir, email
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (id_siswa) DO UPDATE SET
                  id_orangtua = EXCLUDED.id_orangtua,
                  id_agama = EXCLUDED.id_agama,
                  nipd = EXCLUDED.nipd,
                  nisn = EXCLUDED.nisn,
                  nama = EXCLUDED.nama,
                  tempat_lahir = EXCLUDED.tempat_lahir,
                  tanggal_lahir = EXCLUDED.tanggal_lahir,
                  email = EXCLUDED.email
              RETURNING *;
            `;

        const resultSiswa = await client.query(querySiswa, [
          id_siswa, 
          id_orangtua,
          id_agama,
          nipd,
          nisn,
          nama,
          tempat_lahir,
          tanggal_lahir,
          email
        ]);

        results.push(resultSiswa.rows[0]);
      }

      await client.query("COMMIT");

      res.status(200).json({
        message: "Data Berhasil di Import dan di perbaharui",
        count: results.length,
        data: results,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Gagal Import Data", error.message);
      res.status(500).json({ error: "Gagal Import Data Dapodik" });
    } finally {
      client.release();
    }
  },

  async importPengguna(req, res) {

    let client;

    try {
      const filePath = path.join(__dirname, "../data/getPengguna.json");
      const rawData = fs.readFileSync(filePath, "utf-8");
      const dapodikData = JSON.parse(rawData);

      const dataPengguna = Array.isArray(dapodikData) ? dapodikData : dapodikData.rows;

      const uniqueSiswa = new Map();
      const uniquePtk = new Map();

      for (const pengguna of dataPengguna) {
        if (
          pengguna.peserta_didik_id &&
          !uniqueSiswa.has(pengguna.peserta_didik_id)
        ) {
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

      // update siswa
      for (const pengguna of uniqueSiswa.values()) {
        const querySiswa = `
                INSERT INTO siswa (id_siswa, alamat, no_telp, email)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id_siswa) DO UPDATE SET
                alamat = EXCLUDED.alamat,
                no_telp = EXCLUDED.no_telp,
                email = EXCLUDED.email
          RETURNING *;
          `;

        const email = pengguna.username ? pengguna.username.trim() : null;
        const alamat = pengguna.alamat ? pengguna.alamat.trim() : null;
        const nomor_hp = pengguna.no_hp || pengguna.no_telp ;
        const no_telp = pengguna.nomor_hp ? String(nomor_hp).trim() : null;
        
        const resultSiswa = await client.query(querySiswa, [
          pengguna.peserta_didik_id,
          alamat,
          no_telp,
          email
        ]);
        totalSiswaUpdated += resultSiswa.rowCount;
      }

      // === UPDATE PTK ===
      for (const pengguna of uniquePtk.values()) {
        const queryPtk = `
                  INSERT INTO ptk (id_ptk, no_telp, email)
                  VALUES ($1, $2, $3)
                  ON CONFLICT (id_ptk) DO UPDATE SET
                  email = EXCLUDED.email,
                  no_telp = EXCLUDED.no_telp
          RETURNING *;
                `;

        const email = pengguna.username ? pengguna.username.trim() : null;
        const nomor_hp = pengguna.no_hp || pengguna.no_telp ;
        const no_telp = pengguna.no_hp ? String(pengguna.no_hp).trim() : null;
        
        const resultPtk = await client.query(queryPtk, [
          pengguna.ptk_id,
          no_telp,
          email
        ]);
        totalPtkUpdated += resultPtk.rowCount;
      }

      await client.query("COMMIT");

      res.json({
        message: "Data siswa & ptk berhasil diupdate",
        updated: {
          siswa: totalSiswaUpdated,
          ptk: totalPtkUpdated,
        },
      });
    } catch (err) {
      if (client) await client.query("ROLLBACK");
      console.error("Error update data:", err);
      res.status(500).json({ success: false, error: err.message });
    } finally {
      if (client) client.release();
    }
  },
};
