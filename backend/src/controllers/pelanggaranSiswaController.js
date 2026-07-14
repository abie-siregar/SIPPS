const pool = require("../../config/database");

module.exports = {
  //menambahkan pelanggaran baru
  async create(req, res) {
    const { id_siswa, id_ptk, id_semester, id_poin, tanggal, keterangan } =
      req.body;

    if (
      !tanggal ||
      !keterangan ||
      !id_siswa ||
      !id_ptk ||
      !id_semester ||
      !id_poin
    ) {
      return res.status(400).json({
        error:
          "tanggal, keterangan, ID siswa, ID ptk, ID semester, dan ID poin harus diisi dengan benar.",
      });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO 
                pelanggaran_siswa (id_siswa, id_poin, id_ptk, id_semester, tanggal, keterangan)
            VALUES 
                ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
        [id_siswa, id_poin, id_ptk, id_semester, tanggal, keterangan],
      );

      const poinDb = await client.query(
        `SELECT
          bobot
         FROM
          poin_pelanggaran 
         WHERE
          id_poin = $1`,
        [id_poin],
      );

      if (poinDb.rows.length === 0) {
        throw new Error("Master Poin tidak ditemukan");
      }

      const bobotBaru = poinDb.rows[0].bobot;

      const rombelDb = await client.query(
        `SELECT
          id_rombel
          FROM
            anggota_rombel
          WHERE
          id_siswa = $1`,
        [id_siswa],
      );
      if (rombelDb.rows.length === 0) {
        throw new Error("Siswa belum terdaftar di rombel mana pun.");
      }
      const id_rombel = rombelDb.rows[0].id_rombel;

      const updateSaldoDb = await client.query(
        `UPDATE anggota_rombel 
       SET saldo_poin = COALESCE(saldo_poin, 0) + $1
       WHERE id_siswa = $2 AND id_rombel = $3
       RETURNING saldo_poin`,
        [bobotBaru, id_siswa, id_rombel],
      );
      const totalPoinSekarang = updateSaldoDb.rows[0].saldo_poin;

      const sanksiDb = await client.query(
        `SELECT id_master_sanksi, nama_sanksi FROM master_sanksi
       WHERE batas_poin <= $1
       ORDER BY batas_poin DESC LIMIT 1`,
        [totalPoinSekarang],
      );
      if (sanksiDb.rows.length > 0) {
        const { id_master_sanksi, nama_sanksi } = sanksiDb.rows[0];

        const checkSanksiSiswa = await client.query(
          `SELECT id_sanksi_siswa FROM sanksi_siswa 
         WHERE id_siswa = $1 AND id_master_sanksi = $2 AND id_semester = $3 AND status != 'SELESAI'`,
          [id_siswa, id_master_sanksi, id_semester],
        );

        if (checkSanksiSiswa.rows.length === 0) {
          const insertSanksiDb = await client.query(
            `INSERT INTO sanksi_siswa (id_siswa, id_master_sanksi, id_semester, tanggal, keterangan, status)
           VALUES ($1, $2, $3, NOW(), $4, 'BARU')
           RETURNING id_sanksi_siswa`,
            [
              id_siswa,
              id_master_sanksi,
              id_semester,
              `Otomatis: Akumulasi poin mencapai ${totalPoinSekarang} (Sanksi: ${nama_sanksi})`,
            ],
          );
          const id_sanksi_siswa_baru = insertSanksiDb.rows[0].id_sanksi_siswa;

          const bkDb = await client.query(
            `SELECT
                id_ptk_bk
              FROM 
                plotting_bk 
              WHERE 
                id_rombel = $1 LIMIT 1`,
            [id_rombel],
          );
          const id_ptk_pendamping = bkDb.rows[0]?.id_ptk_bk || id_ptk;

          await client.query(
            `INSERT INTO progres_pembinaan (id_sanksi_siswa, tanggal, tahap_pembinaan, catatan_perkembangan, id_ptk_pendamping)
           VALUES ($1, NOW(), 'TAHAP_1', 'Sanksi otomatis terbit. Menunggu tindak lanjut pendamping.', $2)`,
            [id_sanksi_siswa_baru, id_ptk_pendamping],
          );

          const waliDb = await client.query(
            `SELECT
              u.id_user
            FROM
              rombel r
            INNER JOIN 
              users u ON u.id_ptk = r.id_ptk_wali
            WHERE
              r.id_rombel = $1`,
            [id_rombel],
          );

          const id_user_wali = waliDb.rows[0]?.id_user;

          const bkUserDb = await client.query(
            `SELECT 
             u.id_user 
            FROM 
              plotting_bk pbk
           INNER JOIN 
              users u ON u.id_ptk = pbk.id_ptk_bk
           WHERE 
              pbk.id_rombel = $1 
           LIMIT 1`,
            [id_rombel],
          );
          const id_user_bk = bkUserDb.rows[0]?.id_user;

          const OrtuUserDB = await client.query(
            `SELECT
              u.id_user
            From 
              orangtua_wali ow
            INNER JOIN
              users u on u.id_orangtua = ow.id_orangtua
            INNER JOIN
              siswa s on s.id_orangtua = ow.id_orangtua
            WHERE
              s.id_siswa = $1
            LIMIT 1`,
          );
          const id_user_orangtua = OrtuUserDB.rows[0]?.id_user;

          if (id_user_wali) {
            const pesanNotif = `Siswa bimbingan mendapat sanksi: ${nama_sanksi} (${totalPoinSekarang} Poin).`;
            await client.query(
              `INSERT INTO notifikasi (id_user, judul, pesan, is_read, created_at) VALUES ($1, $2, 'SANKSI', false, NOW())`,
              [id_user_wali, pesanNotif],
            );
          }
          if (id_user_bk) {
            const pesanNotif = `Siswa bimbingan mendapat sanksi: ${nama_sanksi} (${totalPoinSekarang} Poin).`;
            await client.query(
              `INSERT INTO notifikasi (id_user, judul, pesan, is_read, created_at) VALUES ($1, $2, 'SANKSI', false, NOW())`,
              [id_user_bk, pesanNotif],
            );
          }
          if (id_user_orangtua) {
            const pesanNotif = ` Ananda mendapat sanksi: ${nama_sanksi} dengan akumulasi (${totalPoinSekarang} Poin).`;
            await client.query(
              `INSERT INTO notifikasi (id_user, judul, pesan, is_read, created_at) VALUES ($1, $2, 'SANKSI', false, NOW())`,
              [id_user_orangtua, pesanNotif],
            );
          }
        }
      }

      await client.query("COMMIT");

      res.status(201).json({
        message: "Data pelanggaran siswa berhasil ditambahkan",
        data: result.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(
        "Gagal menambahkan data pelanggaran siswa :",
        error.message,
      );
      res.status(500).json({ error: "Internal Server Error " + error.message });
    } finally {
      client.release();
    }
  },

  // Memperbaharui data pelanggaran_siswa
  async update(req, res) {
    const { id } = req.params;
    const { id_ptk, id_poin, id_semester, tanggal, keterangan } = req.body;

    if (!tanggal || !keterangan || !id_ptk || !id_poin || !id_semester) {
      return res.status(400).json({
        error: "Data pelanggaran harus di isi dengan benar!",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const pelanggaranLamaDb = await client.query(
        `SELECT id_siswa, id_poin FROM pelanggaran_siswa WHERE id_pelanggaran = $1`,
        [id],
      );

      if (pelanggaranLamaDb.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Data pelanggaran tidak ditemukan" });
      }

      const id_siswa = pelanggaranLamaDb.rows[0].id_siswa;
      const idPoinLama = pelanggaranLamaDb.rows[0].id_poin;

      const bobotLamaDb = await client.query(
        `SELECT bobot FROM poin_pelanggaran WHERE id_poin = $1`,
        [idPoinLama],
      );
      const bobotBaruDb = await client.query(
        `SELECT bobot FROM poin_pelanggaran WHERE id_poin = $1`,
        [id_poin],
      );

      if (bobotBaruDb.rows.length === 0) {
        throw new Error("Master Poin baru tidak ditemukan");
      }

      const bobotLama = bobotLamaDb.rows[0]?.bobot || 0;
      const bobotBaru = bobotBaruDb.rows[0]?.bobot || 0;
      const selisihPoin = bobotBaru - bobotLama;

      const result = await client.query(
        `UPDATE pelanggaran_siswa
       SET id_ptk = $1, id_poin = $2, id_semester = $3, tanggal = $4, keterangan = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id_pelanggaran = $6 
       RETURNING *`,
        [id_ptk, id_poin, id_semester, tanggal, keterangan, id],
      );

      const updateSaldoDb = await client.query(
        `UPDATE anggota_rombel 
       SET saldo_poin = GREATEST(COALESCE(saldo_poin, 0) + $1, 0)
       WHERE id_siswa = $2
       RETURNING saldo_poin, id_rombel`,
        [selisihPoin, id_siswa],
      );

      if (updateSaldoDb.rows.length === 0) {
        throw new Error("Data rombel siswa tidak ditemukan.");
      }

      const totalPoinSekarang = updateSaldoDb.rows[0].saldo_poin;
      const id_rombel = updateSaldoDb.rows[0].id_rombel;

      const sanksiDb = await client.query(
        `SELECT id_master_sanksi, nama_sanksi FROM master_sanksi
       WHERE batas_poin <= $1
       ORDER BY batas_poin DESC LIMIT 1`,
        [totalPoinSekarang],
      );

      if (sanksiDb.rows.length > 0) {
        const { id_master_sanksi, nama_sanksi } = sanksiDb.rows[0];

        const checkSanksiSiswa = await client.query(
          `SELECT id_sanksi_siswa FROM sanksi_siswa 
         WHERE id_siswa = $1 AND id_master_sanksi = $2 AND id_semester = $3 AND status != 'SELESAI'`,
          [id_siswa, id_master_sanksi, id_semester],
        );

        if (checkSanksiSiswa.rows.length === 0) {
          const insertSanksiDb = await client.query(
            `INSERT INTO sanksi_siswa (id_siswa, id_master_sanksi, id_semester, tanggal, keterangan, status)
           VALUES ($1, $2, $3, NOW(), $4, 'BARU')
           RETURNING id_sanksi_siswa`,
            [
              id_siswa,
              id_master_sanksi,
              id_semester,
              `Otomatis (Update): Akumulasi penyesuaian poin mencapai ${totalPoinSekarang} (Sanksi: ${nama_sanksi})`,
            ],
          );
          const id_sanksi_siswa_baru = insertSanksiDb.rows[0].id_sanksi_siswa;

          const bkDb = await client.query(
            `SELECT id_ptk_bk FROM plotting_bk WHERE id_rombel = $1 LIMIT 1`,
            [id_rombel],
          );
          const id_ptk_pendamping = bkDb.rows[0]?.id_ptk_bk || id_ptk;

          await client.query(
            `INSERT INTO progres_pembinaan (id_sanksi_siswa, tanggal, tahap_pembinaan, catatan_perkembangan, id_ptk_pendamping)
           VALUES ($1, NOW(), 'TAHAP_1', 'Sanksi otomatis terbit akibat penyesuaian data.', $2)`,
            [id_sanksi_siswa_baru, id_ptk_pendamping],
          );

          const waliDb = await client.query(
            `SELECT u.id_user FROM rombel r
           INNER JOIN users u ON u.id_ptk = r.id_ptk_wali
           WHERE r.id_rombel = $1`,
            [id_rombel],
          );
          const id_user_wali = waliDb.rows[0]?.id_user;

          const bkUserDb = await client.query(
            `SELECT u.id_user FROM plotting_bk pbk
           INNER JOIN users u ON u.id_ptk = pbk.id_ptk_bk
           WHERE pbk.id_rombel = $1 LIMIT 1`,
            [id_rombel],
          );
          const id_user_bk = bkUserDb.rows[0]?.id_user;

          const pesanNotif = `Penyesuaian data: Siswa bimbingan mendapat sanksi ${nama_sanksi} (${totalPoinSekarang} Poin).`;

          if (id_user_wali) {
            await client.query(
              `INSERT INTO notifikasi (id_user, pesan, tipe, is_read, created_at) VALUES ($1, $2, 'SANKSI', false, NOW())`,
              [id_user_wali, pesanNotif],
            );
          }
          if (id_user_bk) {
            await client.query(
              `INSERT INTO notifikasi (id_user, pesan, tipe, is_read, created_at) VALUES ($1, $2, 'SANKSI', false, NOW())`,
              [id_user_bk, pesanNotif],
            );
          }
        }
      }

      await client.query("COMMIT");

      res.json({
        message: "Data berhasil diupdate dan saldo poin disesuaikan",
        data: result.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error updating data pelanggaran:", error.message);
      res.status(500).json({ error: "Internal Server Error " + error.message });
    } finally {
      client.release();
    }
  },

  //menghapus data pelanggaran_siswa
  async delete(req, res) {
    const { id } = req.params;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const pelanggaranDb = await client.query(
        `SELECT id_siswa, id_poin FROM pelanggaran_siswa WHERE id_pelanggaran = $1`,
        [id],
      );

      if (pelanggaranDb.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Data pelanggaran tidak ditemukan" });
      }

      const { id_siswa, id_poin } = pelanggaranDb.rows[0];

      const poinDb = await client.query(
        `SELECT bobot FROM poin_pelanggaran WHERE id_poin = $1`,
        [id_poin],
      );
      const bobotDihapus = poinDb.rows[0]?.bobot || 0;

      await client.query(
        `DELETE FROM pelanggaran_siswa WHERE id_pelanggaran = $1`,
        [id],
      );

      await client.query(
        `UPDATE anggota_rombel 
       SET saldo_poin = GREATEST(COALESCE(saldo_poin, 0) - $1, 0)
       WHERE id_siswa = $2`,
        [bobotDihapus, id_siswa],
      );

      // Get updated points
      const updatedRombel = await client.query(
        `SELECT saldo_poin FROM anggota_rombel WHERE id_siswa = $1`,
        [id_siswa]
      );
      const newPoints = updatedRombel.rows[0]?.saldo_poin || 0;

      // Find sanksi records that need to be deleted (where master_sanksi.batas_poin > newPoints)
      const sanksiToDelete = await client.query(
        `SELECT ss.id_sanksi_siswa 
         FROM sanksi_siswa ss
         INNER JOIN master_sanksi ms ON ms.id_master_sanksi = ss.id_master_sanksi
         WHERE ss.id_siswa = $1 AND ms.batas_poin > $2`,
        [id_siswa, newPoints]
      );

      const sanksiIds = sanksiToDelete.rows.map((row) => row.id_sanksi_siswa);

      if (sanksiIds.length > 0) {
        // Delete related progres_pembinaan
        await client.query(
          `DELETE FROM progres_pembinaan WHERE id_sanksi_siswa = ANY($1)`,
          [sanksiIds]
        );

        // Delete from sanksi_siswa
        await client.query(
          `DELETE FROM sanksi_siswa WHERE id_sanksi_siswa = ANY($1)`,
          [sanksiIds]
        );
      }

      await client.query("COMMIT");

      res.json({
        message:
          "Data Pelanggaran Berhasil dihapus dan saldo poin siswa telah dikurangi",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error deleting data pelanggaran:", error.message);
      res
        .status(500)
        .json({ error: "Internal Server Error: " + error.message });
    } finally {
      client.release();
    }
  },

  //mengambil seluruh data pelanggaran_siswa
  async getAll(req, res) {
    try {
      const id = req.user?.id;

      // 1. Ambil data user terlebih dahulu
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

      // PAGINATION: Ambil dari query string, default page 1, limit 10 data
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      let queryParams = [];
      let paramIndex = 1;

      // Masukkan distinct on di awal kolom order by agar valid secara sintaks
      let queryText = `
      SELECT 
          distinct on (pelanggaran.tanggal, siswa.id_siswa, pelanggaran.keterangan)
          pelanggaran.id_pelanggaran,
          pelanggaran.id_siswa,
          pelanggaran.id_poin,
          pelanggaran.id_ptk,
          pelanggaran.id_semester,
          pelanggaran.tanggal,
          pelanggaran.keterangan,
          popel.jenis_penilaian,
          popel.jenis_pelanggaran,
          popel.bobot, 
          ptk.nama as nama_ptk,
          jabatan.nama_jabatan,
          siswa.nama as nama_siswa,
          siswa.nisn,
          semester.nama_semester,
          walikelas.nama as walikelas,
          rombel.nama_rombel,
          jurusan.nama_jurusan
      FROM
          pelanggaran_siswa pelanggaran
      LEFT JOIN
          poin_pelanggaran popel ON popel.id_poin = pelanggaran.id_poin
      LEFT JOIN
          ptk ON ptk.id_ptk = pelanggaran.id_ptk
      LEFT JOIN
          siswa ON siswa.id_siswa = pelanggaran.id_siswa
      LEFT JOIN
          anggota_rombel ON anggota_rombel.id_siswa = pelanggaran.id_siswa
      LEFT JOIN
          rombel ON rombel.id_rombel = anggota_rombel.id_rombel
      LEFT JOIN
          semester ON semester.id_semester = pelanggaran.id_semester
      LEFT JOIN
          jurusan ON jurusan.id_jurusan = rombel.id_jurusan
      LEFT JOIN
          ptk walikelas ON walikelas.id_ptk = rombel.id_ptk_wali
      LEFT JOIN
          jabatan_ptk jabatan ON jabatan.id_jabatan = ptk.id_jabatan
      `;

      if (id_role === role.BK) {
        queryText += `
        INNER JOIN plotting_bk pbk ON rombel.id_rombel = pbk.id_rombel
        WHERE pbk.id_ptk_bk = $${paramIndex}
      `;
        queryParams.push(id_ptk);
        paramIndex++;
      } else if (id_role === role.wali_kelas) {
        queryText += `
        WHERE rombel.id_ptk_wali = $${paramIndex}
      `;
        queryParams.push(id_ptk);
        paramIndex++;
      }

      // WAJIB: Aturan DISTINCT ON mengharuskan kolom ekspresinya berada di urutan pertama ORDER BY
      queryText += `
      ORDER BY
        pelanggaran.tanggal DESC, 
        siswa.id_siswa,
        pelanggaran.keterangan
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

      queryParams.push(limit, offset);

      const result = await pool.query(queryText, queryParams);

      // Kembalikan metadata pagination beserta datanya biar frontend lu tau cara mappingnya
      res.json({
        page,
        limit,
        total_rows: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      console.error("Error fetching ptk:", error.message);
      res.status(500).json({ error: "Internal Server Error " + error.message });
    }
  },

  //mengambil data by id
  async getById(req, res) {
    try {
      const userId = req.user?.id; // Diambil dari middleware autentikasi JWT
      const { id: targetSiswaId } = req.params; // ID Siswa yang dikirim melalui URL parameter

      if (!targetSiswaId) {
        return res.status(400).json({ error: "ID Siswa wajib disertakan" });
      }

      // 1. Ambil data profil & role user yang sedang login
      const userDb = await pool.query(
        `SELECT id_role, id_ptk, id_orangtua FROM users WHERE id_user = $1`,
        [userId],
      );

      if (userDb.rows.length === 0) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      const { id_role, id_ptk, id_orangtua } = userDb.rows[0];

      // Definisikan mapping ID Role sistem Anda
      const role = { admin: 1, BK: 102, wali_kelas: 103, orang_tua: 104 };

      // 2. VALIDASI KEPEMILIKAN DATA (SECURITY GATEKEEPER)

      // JIKA ORANG TUA: Pastikan targetSiswaId adalah benar anaknya
      if (id_role === role.orang_tua) {
        const checkAnak = await pool.query(
          `SELECT id_orangtua FROM orang_tua_wali WHERE id_orangtua = $1 AND id_siswa = $2`,
          [id_orangtua, targetSiswaId],
        );

        if (checkAnak.rows.length === 0) {
          return res.status(403).json({
            error:
              "Akses ditolak. Anda tidak memiliki izin untuk melihat riwayat siswa ini.",
          });
        }
      }

      // 3. BASE QUERY UTAMA (Mengambil data pelanggaran)
      let queryParams = [targetSiswaId];
      let paramIndex = 2;

      let queryText = `
        SELECT 
            distinct on (pelanggaran.tanggal, siswa.id_siswa, pelanggaran.keterangan)
            pelanggaran.id_pelanggaran,
            pelanggaran.id_siswa,
            pelanggaran.id_poin,
            pelanggaran.id_ptk,
            pelanggaran.id_semester,
            pelanggaran.tanggal,
            pelanggaran.keterangan,
            popel.jenis_penilaian,
            popel.jenis_pelanggaran,
            popel.bobot as poin,
            ptk.nama as nama_ptk,
            jabatan.nama_jabatan,
            siswa.nama as nama_siswa,
            siswa.nisn,
            semester.nama_semester,
            walikelas.nama as walikelas,
            rombel.nama_rombel,
            jurusan.nama_jurusan
        FROM
            pelanggaran_siswa pelanggaran
        LEFT JOIN
            poin_pelanggaran popel ON popel.id_poin = pelanggaran.id_poin
        LEFT JOIN
            ptk ON ptk.id_ptk = pelanggaran.id_ptk
        LEFT JOIN
            siswa ON siswa.id_siswa = pelanggaran.id_siswa
        LEFT JOIN
            anggota_rombel ON anggota_rombel.id_siswa = pelanggaran.id_siswa
        LEFT JOIN
            rombel ON rombel.id_rombel = anggota_rombel.id_rombel
        LEFT JOIN
            semester ON semester.id_semester = pelanggaran.id_semester
        LEFT JOIN
            jurusan ON jurusan.id_jurusan = rombel.id_jurusan
        LEFT JOIN
            ptk walikelas ON walikelas.id_ptk = rombel.id_ptk_wali
        LEFT JOIN
            jabatan_ptk jabatan ON jabatan.id_jabatan = ptk.id_jabatan
        WHERE 
            pelanggaran.id_siswa = $1
      `;

      if (id_role === role.BK) {
        queryText += `
          AND rombel.id_rombel IN (
            SELECT id_rombel FROM plotting_bk WHERE id_ptk_bk = $${paramIndex}
          )
        `;
        queryParams.push(id_ptk);
        paramIndex++;
      } else if (id_role === role.wali_kelas) {
        queryText += `
          AND rombel.id_ptk_wali = $${paramIndex}
        `;
        queryParams.push(id_ptk);
        paramIndex++;
      }

      queryText += `
        ORDER BY
          pelanggaran.tanggal DESC, 
          siswa.id_siswa
      `;

      const result = await pool.query(queryText, queryParams);

      return res.status(200).json({ data: result.rows });
    } catch (error) {
      console.error("Error pada PelanggaranController.getById:", error.message);
      return res
        .status(500)
        .json({ error: "Internal Server Error: " + error.message });
    }
  },

  //mengambil seluruh data pelanggaran_siswa BY Filter
  async getFiltered(req, res) {
    try {
      const { id_siswa, id_semester } = req.query;

      const whereConditions = [];
      const queryParams = [];

      if (id_siswa) {
        queryParams.push(id_siswa);
        whereConditions.push(`pelanggaran.id_siswa = $${queryParams.length}`);
      }

      if (id_semester) {
        queryParams.push(id_semester);
        whereConditions.push(
          `pelanggaran.id_semester = $${queryParams.length}`,
        );
      }
      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const query = `
            SELECT 
            distinct on (pelanggaran.tanggal, siswa.id_siswa, pelanggaran.keterangan)
            pelanggaran.id_pelanggaran,
            pelanggaran.id_siswa,
            pelanggaran.id_poin,
            pelanggaran.id_ptk,
            pelanggaran.id_semester,
            pelanggaran.tanggal,
            pelanggaran.keterangan,
            popel.jenis_penilaian,
            popel.jenis_pelanggaran,
            popel.bobot, 
            ptk.nama as nama_ptk,
            jabatan.nama_jabatan,
            siswa.nama as nama_siswa,
            siswa.nisn,
            semester.nama_semester,
            walikelas.nama as walikelas,
            rombel.nama_rombel,
            jurusan.nama_jurusan
        FROM
            pelanggaran_siswa pelanggaran
        LEFT JOIN
            poin_pelanggaran popel ON popel.id_poin = pelanggaran.id_poin
        LEFT JOIN
            ptk ON ptk.id_ptk = pelanggaran.id_ptk
        LEFT JOIN
            siswa ON siswa.id_siswa = pelanggaran.id_siswa
        LEFT JOIN
            anggota_rombel ON anggota_rombel.id_siswa = pelanggaran.id_siswa
        LEFT JOIN
            rombel ON rombel.id_rombel = anggota_rombel.id_rombel
        LEFT JOIN
            semester ON semester.id_semester = pelanggaran.id_semester
        LEFT JOIN
            jurusan ON jurusan.id_jurusan = rombel.id_jurusan
        LEFT JOIN
            ptk walikelas ON walikelas.id_ptk = rombel.id_ptk_wali
        LEFT JOIN
            jabatan_ptk jabatan ON jabatan.id_jabatan = ptk.id_jabatan
            ${whereClause}
        ORDER BY
            pelanggaran.tanggal
        DESC, siswa.id_siswa
        `;

      const result = await pool.query(query, queryParams);

      res.json({
        success: true,
        total: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "Error fetching filtered pelanggaran siswa:",
        error.message,
      );
      res
        .status(500)
        .json({ error: "Internal Server Error: " + error.message });
    }
  },

  // mengambil data semester
  async getSemesters(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM semester ORDER BY id_semester DESC",
      );
      res.json(result.rows);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal Server Error: " + error.message });
    }
  },
};
