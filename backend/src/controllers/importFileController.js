const pool = require("../../config/database");
const ExcelJS = require("exceljs");

module.exports = {
  async importPelanggaran(req, res) {
    // 1. Pastikan ada file yang diunggah
    if (!req.file) {
      return res.status(400).json({ error: "Mohon unggah file Excel (.xlsx)" });
    }

    const client = await pool.connect();

    try {
      // 2. Baca file Excel dari buffer memori (menggunakan exceljs)
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);

      const worksheet = workbook.getWorksheet(1); // Ambil sheet pertama

      await client.query("BEGIN");

      let rowsImported = 0;

      // 3. Looping baris Excel (Mulai dari baris ke-2, karena baris 1 adalah Header/Judul Kolom)
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);

        // Ambil data berdasarkan urutan kolom di template Excel kamu
        const id_siswa = row.getCell(1).value; // Kolom A
        const id_poin = row.getCell(2).value; // Kolom B
        const id_ptk = row.getCell(3).value; // Kolom C
        const id_semester = row.getCell(4).value; // Kolom D
        const tanggal = row.getCell(5).value; // Kolom E
        const keterangan = row.getCell(6).value; // Kolom F

        // Skip jika baris kosong
        if (!id_siswa || !id_poin) continue;

        // =======================================================
        // ALUR DOMINO UTAMA (Sama seperti fungsi Create)
        // =======================================================

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

        // E. Cek Ambang Batas Sanksi
        const sanksiDb = await client.query(
          `SELECT id_master_sanksi, nama_sanksi FROM master_sanksi WHERE batas_poin <= $1 ORDER BY batas_poin DESC LIMIT 1`,
          [totalPoinSekarang],
        );

        if (sanksiDb.rows.length > 0) {
          const { id_master_sanksi, nama_sanksi } = sanksiDb.rows[0];

          // Cek duplikasi sanksi di semester yang sama
          const checkSanksiSiswa = await client.query(
            `SELECT id_sanksi_siswa FROM sanksi_siswa WHERE id_siswa = $1 AND id_master_sanksi = $2 AND id_semester = $3 AND status != 'SELESAI'`,
            [id_siswa, id_master_sanksi, id_semester],
          );

          if (checkSanksiSiswa.rows.length === 0) {
            // Insert sanksi_siswa
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
