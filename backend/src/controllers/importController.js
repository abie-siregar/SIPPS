const { count } = require("console");
const pool = require("../../config/database");
const fs = require("fs");
const path = require("path");

module.exports = {

    async importPtk(req, res) {
            try {
                const filePath = path.join(__dirname, "../data/getGtk.json");
                const rawData = fs.readFileSync(filePath, "utf-8");
                const dapodikData = JSON.parse(rawData);
    
                const dataGtk= Array.isArray(dapodikData) ? dapodikData : dapodikData.rows;

                const results = [];
    
                for (const gtk of dataGtk) {
                  
                  const ptk_id_dapodik = gtk.ptk_id;
                  const nuptk = gtk.nuptk;
                  const nik = gtk.nik;
                  const nip = gtk.nip;
                  const agama_id = gtk.agama_id.toString();
                  const nama = gtk.nama;
                  const jenis_kelamin = gtk.jenis_kelamin;
                  const jenis_ptk_id = gtk.jenis_ptk_id;
                  const jabatan_ptk_id = gtk.jabatan_ptk_id;
                  const alamat = gtk.alamat;
                  const email = gtk.email;
    
            const query = `
              INSERT INTO ptk (
                ptk_id_dapodik, nuptk, nik, nip, agama_id, nama, jenis_kelamin, jenis_ptk_id, jabatan_ptk_id,
                alamat, email
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              RETURNING *;
            `;
    
            const result = await pool.query(query, [
              ptk_id_dapodik, nuptk, nik, nip, agama_id, nama, jenis_kelamin, jenis_ptk_id, jabatan_ptk_id,
              alamat, email
            ]);
    
            results.push(result.rows[0]);
          }
    
                res.status(200).json({
                    message: " Data Berhasil di Import", count: results.length, data:results, 
                });
            } catch (error) {
                console.error("Gagal Import Data", error.message);
                res.status(500).json({error: "Gagal Import Data Dapodik"})
            }
        },

    async importRombel(req, res) {
            try {
                const filePath = path.join(__dirname, "../data/getRombonganBelajar.json");
                const rawData = fs.readFileSync(filePath, "utf-8");
                const dapodikData = JSON.parse(rawData);
    
                const dataRombel= Array.isArray(dapodikData) ? dapodikData : dapodikData.rows;

                const results = [];
    
                for (const rombel of dataRombel) {
                  
                  const rombel_id_dapodik = rombel.rombongan_belajar_id;
                  const nama = rombel.nama;
                  const ptk_id_dapodik = rombel.ptk_id;
                  const tingkat_id = rombel.tingkat_pendidikan_id;
                  const jurusan_id = rombel.jurusan_id;
    
            const query = `
              INSERT INTO rombel (
                rombel_id_dapodik, nama, ptk_id_dapodik, tingkat_id, jurusan_id
                ) 
                VALUES ($1, $2, $3, $4, $5)
              RETURNING *;
            `;
    
            const result = await pool.query(query, [
              rombel_id_dapodik, nama, ptk_id_dapodik, tingkat_id, jurusan_id
            ]);
    
            results.push(result.rows[0]);
          }
    
                res.status(200).json({
                    message: " Data Berhasil di Import", count: results.length, data:results, 
                });
            } catch (error) {
                console.error("Gagal Import Data", error.message);
                res.status(500).json({error: "Gagal Import Data Dapodik"})
            }
        },

    async importSiswa (req, res) {
            try {
                const filePath = path.join(__dirname, "../data/getPesertaDidik.json");
                const rawData = fs.readFileSync(filePath, "utf-8");
                const dapodikData = JSON.parse(rawData);
    
                const results = [];
    
                for (const siswa of dapodikData) {
                  
                  const siswa_id_dapodik = siswa.peserta_didik_id;
                  const nipd = siswa.nipd;
                  const nisn = siswa.nisn;
                  const nik = siswa.nik;
                  const agama_id = siswa.agama_id.toString();
                  const nama = siswa.nama;
                  const tempat_lahir = siswa.tempat_lahir;
                  const tanggal_lahir = siswa.tanggal_lahir;
                  const email = siswa.email;
                  const semester_id = siswa.semester_id;
                  const rombel_id_dapodik = siswa.rombongan_belajar_id;
    
            const query = `
              INSERT INTO siswa (
                siswa_id_dapodik, nipd, nisn, nik, agama_id, nama, tempat_lahir,
                tanggal_lahir, email, semester_id, rombel_id_dapodik
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (siswa_id_dapodik) DO UPDATE SET
                  nipd = EXCLUDED.nipd,
                  nisn = EXCLUDED.nisn,
                  nik = EXCLUDED.nik,
                  agama_id = EXCLUDED.agama_id,
                  nama = EXCLUDED.nama,
                  tempat_lahir = EXCLUDED.tempat_lahir,
                  tanggal_lahir = EXCLUDED.tanggal_lahir,
                  email = EXCLUDED.email,
                  semester_id = EXCLUDED.semester_id,
                  rombel_id_dapodik = EXCLUDED.rombel_id_dapodik
              RETURNING *;
            `;
    
            const result = await pool.query(query, [
              siswa_id_dapodik, nipd, nisn, nik, agama_id, nama, tempat_lahir,
              tanggal_lahir,
              email, semester_id, rombel_id_dapodik
            ]);
    
            results.push(result.rows[0]);
          }
    
                res.status(200).json({
                    message: "Data Berhasil di Import dan di perbaharui", count: results.length, data:results, 
                });
            } catch (error) {
                console.error("Gagal Import Data da", error.message);
                res.status(500).json({error: "Gagal Import Data Dapodik"})
            }
        },

    async importPengguna(req, res) {
          let client;
            try {
              const filePath = path.join(__dirname, "../data/getPengguna.json");
              const rawData = fs.readFileSync(filePath, "utf-8");
              const dapodikData = JSON.parse(rawData);

              const dataPengguna = Array.isArray(dapodikData) ? dapodikData : dapodikData.rows;

              // === Hilangkan duplikat ID ===
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

              // === UPDATE SISWA ===
              for (const pengguna of uniqueSiswa.values()) {
                const querySiswa = `
                  UPDATE siswa
                  SET email = $1, alamat = $2
                  WHERE siswa_id_dapodik = $3
                `;
                const resultSiswa = await client.query(querySiswa, [
                  pengguna.username,
                  pengguna.alamat,
                  pengguna.peserta_didik_id,
                ]);
                totalSiswaUpdated += resultSiswa.rowCount;
              }

              // === UPDATE PTK ===
              for (const pengguna of uniquePtk.values()) {
                const queryPtk = `
                  UPDATE ptk
                  SET email = $1, alamat = $2
                  WHERE ptk_id_dapodik = $3
                `;
                const resultPtk = await client.query(queryPtk, [
                  pengguna.username,
                  pengguna.alamat,
                  pengguna.ptk_id,
                ]);
                totalPtkUpdated += resultPtk.rowCount;
              }

              await client.query("COMMIT");

              res.json({
                success: true,
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
        }

}