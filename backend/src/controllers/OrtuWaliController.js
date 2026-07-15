const pool = require("../../config/database");
const bcrypt = require("bcrypt");

module.exports = {
  // Mengambil Data Orang Tua
  async getAll(req, res) {
    try {
      const result = await pool.query(
        `SELECT
                ow.id_orangtua,
                ow.nama_ayah as ayah,
                ow.nama_ibu as ibu,
                ow.nama_wali as wali,
                ow.no_telp,
                ow.no_telp_rumah,
                ow.no_kk,
                s.id_siswa, 
                s.nama
              FROM 
                orangtua_wali ow
              LEFT JOIN
                siswa s ON s.id_orangtua = ow.id_orangtua
              ORDER BY 
                s.nama 
              ASC`,
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: "Gagal mengambil data users" });
    }
  },

  // Mengambil data Orangtua Berdasarkan id Siswa
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT
          ow.id_orangtua,
          ow.nama_ayah as ayah,
          ow.nama_ibu as ibu,
          ow.nama_wali as wali,
          ow.no_telp,
          ow.no_telp_rumah,
          ow.no_kk,
          s.id_siswa, 
          s.nama,
          u.id_siswa
        FROM 
          orangtua_wali ow
        LEFT JOIN
          siswa s ON s.id_orangtua = ow.id_orangtua
        left join
          users u on u.id_siswa = s.id_siswa
        WHERE 
          u.id_siswa = $1
                `,
        [id],
      );
      if (result.rows.length === 0)
        return res
          .status(404)
          .json({ message: "Data Orang Tua tidak ditemukan" });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error " + error.message });
    }
  },

  //Update Insert Data Orangtua
  async update(req, res) {
    const { id } = req.params;
    const { nama_ayah, nama_ibu, nama_wali, no_telp, no_telp_rumah, no_kk } =
      req.body;

    if (no_kk && no_kk.length !== 16) {
      return res.status(400).json({
        success: false,
        message: "Nomor Kartu Keluarga harus 16 digit.",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const siswaDb = await client.query(
        `SELECT id_siswa, id_orangtua FROM siswa 
       WHERE id_siswa = $1`,
        [id],
      );
      if (siswaDb.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Data siswa tidak ditemukan." });
      }
      const { id_siswa, id_orangtua } = siswaDb.rows[0];

      let idOrangtuaFinal = id_orangtua;
      let messageResult = "";
      const roleOrangtua = 7;

      if (!id_orangtua) {
        const ortuEksisDb = await client.query(
          `SELECT id_orangtua FROM orangtua_wali WHERE no_kk = $1 LIMIT 1`,
          [no_kk],
        );

        if (ortuEksisDb.rows.length > 0) {
          idOrangtuaFinal = ortuEksisDb.rows[0].id_orangtua;

          await client.query(
            `UPDATE siswa SET id_orangtua = $1 WHERE id_siswa = $2`,
            [idOrangtuaFinal, id_siswa],
          );

          messageResult =
            "Profil berhasil dihubungkan! Kartu Keluarga Anda terdeteksi sudah terdaftar melalui saudara/i Anda.";
        } else {
          const newOrangtua = await client.query(
            `INSERT INTO orangtua_wali (nama_ayah, nama_ibu, nama_wali, no_telp, no_telp_rumah, no_kk, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id_orangtua`,
            [nama_ayah, nama_ibu, nama_wali, no_telp, no_telp_rumah, no_kk],
          );
          idOrangtuaFinal = newOrangtua.rows[0].id_orangtua;

          await client.query(
            `UPDATE siswa SET id_orangtua = $1 WHERE id_siswa = $2`,
            [idOrangtuaFinal, id_siswa],
          );

          const password = no_kk;
          const hashedPassword = await bcrypt.hash(password, 10);
          await client.query(
            `INSERT INTO users (username, password, id_role, id_orangtua, created_at)
            VALUES ($1, $2, $3 , $4, NOW())`,
            [no_kk, hashedPassword, roleOrangtua, idOrangtuaFinal],
          );

          messageResult =
            "Profil orang tua dan akun login keluarga berhasil dibuat!";
        }
      } else {
        let fields = [];
        let values = [];
        let index = 1;

        if (nama_ayah) {
          fields.push(`nama_ayah = $${index++}`);
          values.push(nama_ayah);
        }
        if (nama_ibu) {
          fields.push(`nama_ibu = $${index++}`);
          values.push(nama_ibu);
        }
        if (nama_wali) {
          fields.push(`nama_wali = $${index++}`);
          values.push(nama_wali);
        }
        if (no_telp) {
          fields.push(`no_telp = $${index++}`);
          values.push(no_telp);
        }
        if (no_telp_rumah) {
          fields.push(`no_telp_rumah = $${index++}`);
          values.push(no_telp_rumah);
        }
        if (no_kk) {
          fields.push(`no_kk = $${index++}`);
          values.push(no_kk);
        }

        if (fields.length > 0) {
          fields.push(`updated_at = NOW()`);
          values.push(idOrangtuaFinal);
          await client.query(
            `UPDATE orangtua_wali SET ${fields.join(", ")} WHERE id_orangtua = $${index}`,
            values,
          );
        }

        // 🌟 LOGIKA BARU: Jika no_kk diisi/diperbaharui
        if (no_kk) {
          const checkUserDb = await client.query(
            `SELECT id_user FROM users WHERE id_orangtua = $1 LIMIT 1`,
            [idOrangtuaFinal],
          );

          const hashedPassword = await bcrypt.hash(no_kk, 10);

          if (checkUserDb.rows.length > 0) {
            // Jika user dengan id_orangtua tersebut sudah ada, lakukan UPDATE username & password
            await client.query(
              `UPDATE users SET username = $1, password = $2, updated_at = NOW() WHERE id_orangtua = $3`,
              [no_kk, hashedPassword, idOrangtuaFinal],
            );
          } else {
            // Jika belum terdaftar di tabel users, lakukan INSERT baru
            await client.query(
              `INSERT INTO users (username, password, id_role, id_orangtua, created_at)
              VALUES ($1, $2, $3, $4, NOW())`,
              [no_kk, hashedPassword, roleOrangtua, idOrangtuaFinal],
            );
          }
        }

        messageResult = "Data keluarga berhasil diperbaharui.";
      }

      await client.query("COMMIT");
      res.status(200).json({ success: true, message: messageResult });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error updateOrangtua:", error.message);
      res.status(500).json({ success: false, error: error.message });
    } finally {
      client.release();
    }
  },

  async getMyChildren(req, res) {
    try {
      const userId = req.user?.id; // Diambil dari middleware autentikasi JWT

      const userDb = await pool.query(
        `SELECT id_orangtua, id_role FROM users WHERE id_user = $1`,
        [userId],
      );

      if (userDb.rows.length === 0) {
        return res.status(404).json({ error: "Akun pengguna tidak ditemukan" });
      }

      const { id_orangtua, id_role } = userDb.rows[0];

      const ROLE_ORANG_TUA = 7;
      if (id_role !== ROLE_ORANG_TUA) {
        return res.status(403).json({
          error: "Akses ditolak. Fitur ini hanya untuk akun Orang Tua/Wali.",
        });
      }

      if (!id_orangtua) {
        return res.status(400).json({
          error: "Akun Anda belum terhubung dengan data Wali murid manapun.",
        });
      }

      const childrenQuery = `
        SELECT 
          s.id_siswa, 
          s.nama, 
          s.nisn, 
          r.nama_rombel as kelas,
          j.nama_jurusan as jurusan
        FROM 
          siswa s
        LEFT JOIN 
          anggota_rombel ar ON ar.id_siswa = s.id_siswa
        LEFT JOIN 
          rombel r ON r.id_rombel = ar.id_rombel
        LEFT JOIN
          jurusan j ON j.id_jurusan = r.id_jurusan
        WHERE 
          s.id_orangtua = $1
        ORDER BY 
          s.nama ASC
      `;

      const result = await pool.query(childrenQuery, [id_orangtua]);

      // Kembalikan daftar array anak ke frontend
      return res.status(200).json({ data: result.rows });
    } catch (error) {
      console.error(
        "Error pada OrangTuaController.getMyChildren:",
        error.message,
      );
      return res
        .status(500)
        .json({ error: "Internal Server Error: " + error.message });
    }
  },
};
