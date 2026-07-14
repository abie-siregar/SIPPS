const pool = require("../../config/database");
const ExcelJS = require("exceljs");

module.exports = {
  // Import Data PTK
  async importPTK(req, res) {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Mohon unggah file Excel PTK (.xlsx)" });
    }

    const client = await pool.connect();

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.getWorksheet(1);
      await client.query("BEGIN");

      let rowsImported = 0;

      for (let i = 3; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);

        const nama = row.getCell(2).value;
        const nip = row.getCell(3).value?.toString().trim();
        const nuptk = row.getCell(4).value?.toString().trim();
        const no_telp = row.getCell(6).value?.toString().trim();
        const email = row.getCell(8).value?.toString().trim();
        const id_jenis_jabatan = row.getCell(9).value;
        const id_jabatan = row.getCell(11).value; // Asumsi di Excel berisi ID angka (1, 2, atau 3)

        if (!nama || !id_jenis_jabatan) continue;

        // =======================================================
        // STEP 1: DINAMISASI ROLE & PASSWORD BERDASARKAN ID_JABATAN
        // =======================================================
        let idRoleFinal = 3; // Default role: PTK/Guru Biasa
        let defaultPassword = "sipps@ptk";

        // Jalankan logika penentuan berdasarkan id_jabatan dari Excel
        switch (Number(id_jabatan)) {
          case 21904: // Contoh: Jika ID Jabatan di DB mu adalah 1 untuk Guru BK
            idRoleFinal = 102; // ID Role Guru BK
            defaultPassword = "sipps@bk";
            break;
          default:
            idRoleFinal = 3; // Tetap PTK
            defaultPassword = "sipps@ptk";
            break;
        }

        // =======================================================
        // STEP 2: INSERT DATA PTK
        // =======================================================
        const insertPTK = await client.query(
          `INSERT INTO ptk (id_jabatan, id_jenis_jabatan, nip, nuptk, nama, no_telp, email, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id_ptk`,
          [id_jabatan, id_jenis_jabatan, nip, nuptk, nama, no_telp, email],
        );

        const idPtkBaru = insertPTK.rows[0].id_ptk;

        // =======================================================
        // STEP 3: BUAT AKUN LOGIN UTK GURU / PTK BERDASARKAN ROLE
        // =======================================================
        // Username menggunakan email, jika email kosong gunakan NIP/NUPTK sebagai fallback
        const usernameLogin = email || nip || nuptk;

        if (!usernameLogin) {
          console.warn(
            `Baris ${i} dilewati: PTK tidak memiliki Email, NIP, maupun NUPTK untuk dijadikan username.`,
          );
          continue;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        await client.query(
          `INSERT INTO users (username, password, id_role, id_ptk, is_first_login, created_at)
         VALUES ($1, $2, $3, $4, true, NOW())`,
          [usernameLogin, hashedPassword, idRoleFinal, idPtkBaru],
        );

        rowsImported++;
      } // Akhir dari Loop For

      await client.query("COMMIT");
      res.status(200).json({
        success: true,
        message: `Sukses mengimport data file Excel. Total ${rowsImported} data PTK dan akun login berhasil masuk database.`,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error import Excel:", error.message);
      res
        .status(500)
        .json({ error: "Gagal memproses file Excel: " + error.message });
    } finally {
      client.release();
    }
  },
  //import Data Rombel
  async importRombel(req, res) {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Mohon unggah file Excel Rombel (.xlsx)" });
    }

    const client = await pool.connect();

    // Logging untuk mencatat performa impor per baris
    let importLogs = {
      success_count: 0,
      failed_count: 0,
      errors: [],
    };

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.getWorksheet(1); // Ambil sheet pertama

      await client.query("BEGIN");

      // Looping dari baris ke-3
      for (let i = 3; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);

        const nama_rombel = row.getCell(2).value?.toString().trim();
        const id_tingkat = row.getCell(3).value?.toString().trim();
        const id_jurusan = row.getCell(4).value?.toString().trim();
        const nama_walikelas = row.getCell(6).value?.toString().trim(); // 🌟 Kolom F: Nama Wali Kelas
        const nip_walikelas = row.getCell(7).value?.toString().trim(); // 🌟 Kolom E: NIP Wali Kelas

        // Skip jika baris benar-benar kosong
        if (!nama_rombel) continue;

        try {
          let id_ptk_wali = null;

          // =======================================================
          // STEP 1: VALIDASI DATA WALI KELAS KE TABEL PTK
          // =======================================================
          if (nip_walikelas) {
            // Cari berdasarkan NIP (Paling Akurat)
            const ptkDb = await client.query(
              `SELECT id_ptk FROM ptk WHERE nip = $1 LIMIT 1`,
              [nip_walikelas],
            );

            if (ptkDb.rows.length > 0) {
              id_ptk_wali = ptkDb.rows[0].id_ptk;
            }
          }

          // Fallback: Jika NIP kosong atau tidak ketemu, coba cari berdasarkan nama
          if (!id_ptk_wali && nama_walikelas) {
            const ptkNamaDb = await client.query(
              `SELECT id_ptk FROM ptk WHERE UPPER(TRIM(nama)) = UPPER($1) LIMIT 1`,
              [nama_walikelas],
            );

            if (ptkNamaDb.rows.length > 0) {
              id_ptk_wali = ptkNamaDb.rows[0].id_ptk;
            }
          }

          // Jika wali kelas wajib ada, lemparkan error jika tidak ditemukan di DB
          if (!id_ptk_wali) {
            throw new Error(
              `Wali kelas bernama "${nama_walikelas}" dengan NIP [${nip_walikelas || "-"}] tidak ditemukan di data PTK.`,
            );
          }

          // =======================================================
          // STEP 2: UPSERT / INSERT DATA ROMBEL
          // =======================================================
          await client.query(
            `INSERT INTO rombel (nama_rombel, id_tingkat, id_jurusan, id_ptk_wali, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           ON CONFLICT (nama_rombel) 
           DO UPDATE SET 
              id_tingkat = EXCLUDED.id_tingkat,
              id_jurusan = EXCLUDED.id_jurusan,
              id_ptk_wali = EXCLUDED.id_ptk_wali,
              updated_at = NOW()`,
            [nama_rombel, id_tingkat, id_jurusan, id_ptk_wali],
          );

          importLogs.success_count++;
        } catch (rowError) {
          // Jika baris ini gagal validasi, catat log tanpa menggagalkan baris lainnya
          importLogs.failed_count++;
          importLogs.errors.push({
            baris: i,
            rombel: nama_rombel,
            alasan: rowError.message,
          });
        }
      } // Akhir dari Loop For

      await client.query("COMMIT");

      res.status(200).json({
        success: true,
        message: "Proses import rombel selesai.",
        summary: importLogs,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error import Excel:", error.message);
      res.status(500).json({
        success: false,
        error: "Gagal total memproses file Excel: " + error.message,
      });
    } finally {
      client.release();
    }
  },

  // Import Siswa, Orangtua, Hubungan Rombel, dan Akun Users sekaligus
  async importSiswa(req, res) {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Mohon unggah file Excel PD (.xlsx)" });
    }

    const client = await pool.connect();

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.getWorksheet(1); // Ambil sheet pertama

      await client.query("BEGIN");

      let rowsImported = 0;
      const roleSiswa = 6; // Sesuaikan ID Role Siswa di databasemu
      const roleOrangtua = 7; // ID Role Orang Tua

      // Looping dari baris ke-3 karena baris 1 & 2 biasanya header template
      for (let i = 3; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);

        const nama = row.getCell(2).value;
        const nisn = row.getCell(3).value?.toString().trim(); // Jadikan string dan hapus spasi
        const nipd = row.getCell(4).value?.toString().trim();
        const jenis_kelamin = row.getCell(5).value;
        const no_kk = row.getCell(6).value?.toString().trim();
        const tempat_lahir = row.getCell(8).value;
        const tanggal_lahir = row.getCell(9).value; // Pastikan format tanggal valid di excel
        const alamat = row.getCell(10).value;
        const id_agama = row.getCell(11).value;
        const no_telp = row.getCell(13).value?.toString().trim();
        const nama_ayah = row.getCell(14).value;
        const nama_ibu = row.getCell(15).value;
        const nama_wali = row.getCell(16).value;
        const no_telp_rumah = row.getCell(17).value?.toString().trim();
        const no_telp_orangtua = row.getCell(18).value?.toString().trim();
        const email = row.getCell(19).value;
        const id_rombel = row.getCell(20).value; // Pastikan berupa ID Rombel yang valid

        // Skip jika baris kosong (misal nama atau nisn kosong)
        if (!nama || !nisn) continue;

        // =======================================================
        // STEP 1: PROSES DATA ORANG TUA (CEK DUPLIKASI NO KK)
        // =======================================================
        let idOrangtuaFinal = null;

        if (no_kk) {
          // Cek apakah No KK ini sudah di-import di baris sebelumnya / sudah ada di DB
          const checkOrtu = await client.query(
            `SELECT id_orangtua FROM orangtua_wali WHERE no_kk = $1 LIMIT 1`,
            [no_kk],
          );

          if (checkOrtu.rows.length > 0) {
            // Kakak-Beradik detected: Gunakan id_orangtua yang sudah ada
            idOrangtuaFinal = checkOrtu.rows[0].id_orangtua;
          } else {
            // Keluarga Baru: Insert data orang tua baru
            const insertOrtu = await client.query(
              `INSERT INTO orangtua_wali (no_kk, nama_ayah, nama_ibu, nama_wali, no_telp_rumah, no_telp, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id_orangtua`,
              [
                no_kk,
                nama_ayah,
                nama_ibu,
                nama_wali,
                no_telp_rumah,
                no_telp_orangtua,
              ],
            );
            idOrangtuaFinal = insertOrtu.rows[0].id_orangtua;

            // Buat Akun Login Orang Tua (Username & Password awal = No KK)
            const saltOrtu = await bcrypt.genSalt(10);
            const hashedPassOrtu = await bcrypt.hash(no_kk, saltOrtu);
            await client.query(
              `INSERT INTO users (username, password, id_role, id_orangtua, is_active, created_at)
             VALUES ($1, $2, $3, $4, true, NOW())`,
              [no_kk, hashedPassOrtu, roleOrangtua, idOrangtuaFinal],
            );
          }
        }

        // =======================================================
        // STEP 2: INSERT DATA SISWA
        // =======================================================
        const insertSiswa = await client.query(
          `INSERT INTO siswa (id_agama, id_orangtua, nisn, nipd, nama, tempat_lahir, tanggal_lahir, alamat, no_telp, email, jenis_kelamin, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING id_siswa`,
          [
            id_agama,
            idOrangtuaFinal,
            nisn,
            nipd,
            nama,
            tempat_lahir,
            tanggal_lahir,
            alamat,
            no_telp,
            email,
            jenis_kelamin,
          ],
        );
        const idSiswaBaru = insertSiswa.rows[0].id_siswa;

        // =======================================================
        // STEP 3: BUAT AKUN LOGIN SISWA (Username & Password awal = NISN)
        // =======================================================

        const hashedPassSiswa = await bcrypt.hash(nisn, saltSiswa);
        await client.query(
          `INSERT INTO users (username, password, id_role, id_siswa, is_active, created_at)
         VALUES ($1, $2, $3, $4, true, NOW())`,
          [nisn, hashedPassSiswa, roleSiswa, idSiswaBaru],
        );

        // =======================================================
        // STEP 4: PLOTTING ANGGOTA ROMBEL BERDASARKAN NAMA ROMBEL
        // =======================================================
        if (rombel) {
          // A. Cari id_rombel berdasarkan nama_rombel dari Excel
          const rombelDb = await client.query(
            `SELECT id_rombel 
           FROM rombel 
           WHERE UPPER(TRIM(nama_rombel)) = UPPER(TRIM($1)) 
           LIMIT 1`,
            [rombel],
          );

          // B. Cari id_semester yang saat ini sedang AKTIF di sistem
          const semesterAktifDb = await client.query(
            `SELECT id_semester 
           FROM semester 
           WHERE is_active = 'true'
           LIMIT 1`,
          );

          // Pastikan Rombel ditemukan dan Semester Aktif ada di database
          if (rombelDb.rows.length > 0 && semesterAktifDb.rows.length > 0) {
            const id_rombel = rombelDb.rows[0].id_rombel;
            const id_semester = semesterAktifDb.rows[0].id_semester;

            // C. Input ke anggota_rombel lengkap dengan id_semester aktif
            await client.query(
              `INSERT INTO anggota_rombel (id_siswa, id_rombel, id_semester, saldo_poin)
             VALUES ($1, $2, $3, 0)
             ON CONFLICT (id_siswa, id_semester) DO NOTHING`,
              [idSiswaBaru, id_rombel, id_semester],
            );
          } else {
            // Log peringatan jika ada salah satu data yang tidak sinkron
            if (rombelDb.rows.length === 0) {
              console.warn(
                `Peringatan baris ${i}: Rombel "${rombel}" tidak terdaftar.`,
              );
            }
            if (semesterAktifDb.rows.length === 0) {
              console.warn(
                `Peringatan: Tidak ada semester yang berstatus AKTIF di database.`,
              );
            }
          }
        }

        rowsImported++;
      } // Akhir dari Loop For

      await client.query("COMMIT");
      res.status(200).json({
        success: true,
        message: `Sukses mengimport data file Excel. Total ${rowsImported} data siswa dan akun keluarga berhasil masuk database.`,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error import Excel:", error.message);
      res
        .status(500)
        .json({ error: "Gagal memproses file Excel: " + error.message });
    } finally {
      client.release();
    }
  },

  async importPelanggaran(req, res) {
    if (!req.file) {
      return res.status(400).json({ error: "Mohon unggah file Excel (.xlsx)" });
    }

    const client = await pool.connect();

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);

      const worksheet = workbook.getWorksheet(1);
      await client.query("BEGIN");

      let rowsImported = 0;

      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);

        const id_siswa = row.getCell(1).value; // Kolom A
        const id_poin = row.getCell(2).value; // Kolom B
        const id_ptk = row.getCell(3).value; // Kolom C
        const id_semester = row.getCell(4).value; // Kolom D
        const tanggal = row.getCell(5).value; // Kolom E
        const keterangan = row.getCell(6).value; // Kolom F

        if (!id_siswa || !id_poin) continue;

        // A. Insert Riwayat Pelanggaran
        await client.query(
          `INSERT INTO pelanggaran_siswa (id_siswa, id_poin, id_ptk, id_semester, tanggal, keterangan)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id_siswa, id_poin, id_ptk, id_semester, tanggal, keterangan],
        );

        // B. Ambil Bobot Poin
        const poinDb = await client.query(
          `SELECT bobot FROM poin_pelanggaran WHERE id_poin = $1`,
          [id_poin],
        );
        if (poinDb.rows.length === 0)
          throw new Error(`Master Poin ID ${id_poin} tidak ditemukan`);
        const bobotBaru = poinDb.rows[0].bobot;

        // C. Cari Rombel Siswa
        const rombelDb = await client.query(
          `SELECT id_rombel FROM anggota_rombel WHERE id_siswa = $1`,
          [id_siswa],
        );
        if (rombelDb.rows.length === 0)
          throw new Error(
            `Siswa ID ${id_siswa} tidak terdaftar di rombel mana pun`,
          );
        const id_rombel = rombelDb.rows[0].id_rombel;

        // D. Update Saldo Poin & Dapatkan Totalnya
        const updateSaldoDb = await client.query(
          `UPDATE anggota_rombel SET saldo_poin = COALESCE(saldo_poin, 0) + $1
           WHERE id_siswa = $2 AND id_rombel = $3 RETURNING saldo_poin`,
          [bobotBaru, id_siswa, id_rombel],
        );
        const totalPoinSekarang = updateSaldoDb.rows[0].saldo_poin;

        const sanksiDb = await client.query(
          `SELECT id_master_sanksi, nama_sanksi FROM master_sanksi WHERE batas_poin <= $1 ORDER BY batas_poin DESC LIMIT 1`,
          [totalPoinSekarang],
        );

        if (sanksiDb.rows.length > 0) {
          const { id_master_sanksi, nama_sanksi } = sanksiDb.rows[0];

          const checkSanksiSiswa = await client.query(
            `SELECT id_sanksi_siswa FROM sanksi_siswa WHERE id_siswa = $1 AND id_master_sanksi = $2 AND id_semester = $3 AND status != 'SELESAI'`,
            [id_siswa, id_master_sanksi, id_semester],
          );

          if (checkSanksiSiswa.rows.length === 0) {
            const insertSanksiDb = await client.query(
              `INSERT INTO sanksi_siswa (id_siswa, id_master_sanksi, id_semester, tanggal, keterangan, status)
               VALUES ($1, $2, $3, NOW(), $4, 'BARU') RETURNING id_sanksi_siswa`,
              [
                id_siswa,
                id_master_sanksi,
                id_semester,
                `Otomatis (Import): Akumulasi poin mencapai ${totalPoinSekarang}`,
              ],
            );
            const id_sanksi_siswa_baru = insertSanksiDb.rows[0].id_sanksi_siswa;

            // Cari Guru BK
            const bkDb = await client.query(
              `SELECT id_ptk_bk FROM plotting_bk WHERE id_rombel = $1 LIMIT 1`,
              [id_rombel],
            );
            const id_ptk_pendamping = bkDb.rows[0]?.id_ptk_bk || id_ptk;

            // Insert progres_pembinaan awal
            await client.query(
              `INSERT INTO progres_pembinaan (id_sanksi_siswa, tanggal, tahap_pembinaan, catatan_perkembangan, id_ptk_pendamping)
               VALUES ($1, NOW(), 'TAHAP_1', 'Sanksi otomatis terbit melalui fitur import.', $2)`,
              [id_sanksi_siswa_baru, id_ptk_pendamping],
            );

            // Ambil id_user Wali & BK untuk Notifikasi
            const waliDb = await client.query(
              `SELECT u.id_user FROM rombel r INNER JOIN users u ON u.id_ptk = r.id_ptk_wali WHERE r.id_rombel = $1`,
              [id_rombel],
            );
            const id_user_wali = waliDb.rows[0]?.id_user;

            const bkUserDb = await client.query(
              `SELECT u.id_user FROM plotting_bk pbk INNER JOIN users u ON u.id_ptk = pbk.id_ptk_bk WHERE pbk.id_rombel = $1 LIMIT 1`,
              [id_rombel],
            );
            const id_user_bk = bkUserDb.rows[0]?.id_user;

            const pesanNotif = `Import Data: Siswa bimbingan mendapat sanksi ${nama_sanksi} (${totalPoinSekarang} Poin).`;

            if (id_user_wali) {
              await client.query(
                `INSERT INTO notifikasi (id_user, judul, pesan, is_read, created_at) VALUES ($1, $2, 'SANKSI', false, NOW())`,
                [id_user_wali, pesanNotif],
              );
            }
            if (id_user_bk) {
              await client.query(
                `INSERT INTO notifikasi (id_user, judul, pesan, is_read, created_at) VALUES ($1, $2, 'SANKSI', false, NOW())`,
                [id_user_bk, pesanNotif],
              );
            }
          }
        }
        rowsImported++;
      }

      await client.query("COMMIT");
      res.status(200).json({
        message: `Sukses mengimport data file Excel. Total ${rowsImported} data pelanggaran berhasil masuk database.`,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error import Excel:", error.message);
      res
        .status(500)
        .json({ error: "Gagal memproses file Excel: " + error.message });
    } finally {
      client.release();
    }
  },
};
