const pool = require("../../config/database");

module.exports = {
  async add(req, res) {
    const { id_ptk_bk, id_rombel, id_semester } = req.body;

    if (!id_ptk_bk || !id_rombel || !id_semester) {
      return res.status(400).json({
        error: "Data Guru BK, Rombongan Belajar dan Semester tidak sesuai",
      });
    }

    try {
      const checkJabatan = await pool.query(
        `SELECT id_ptk, id_jabatan FROM ptk WHERE id_ptk = $1`,
        [id_ptk_bk],
      );

      if (checkJabatan.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Data Guru tidak ditemukan di master PTK" });
      }

      if (
        checkJabatan.rows[0].id_jabatan !== "21904" &&
        checkJabatan.rows[0].id_jabatan !== 21904
      ) {
        return res.status(403).json({
          error:
            "Akses ditolak. PTK yang dipilih bukan merupakan Guru BK (Jabatan Tidak Sesuai)",
        });
      }

      const result = await pool.query(
        `INSERT INTO plotting_bk (id_ptk_bk, id_rombel, id_semester)
                VALUES
                ($1, $2, $3)
                RETURNING *`,
        [id_ptk_bk, id_rombel, id_semester],
      );

      res.status(201).json({
        message: "Data telah ditambahkan",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Gagal menambahkan data ", error.message);
      if (
        error.code === "23505" ||
        error.message.includes("unique_rombel_semester")
      ) {
        try {
          // Cari nama guru yang saat ini sudah mengampu rombel ini
          const penanggungJawab = await pool.query(
            `SELECT ptk.nama 
                     FROM plotting_bk 
                     JOIN ptk ON ptk.id_ptk = plotting_bk.id_ptk_bk 
                     WHERE plotting_bk.id_rombel = $1 AND plotting_bk.id_semester = $2`,
            [id_rombel, id_semester],
          );

          const guruBK = penanggungJawab.rows[0]?.nama || "Guru Lain";

          return res.status(409).json({
            error: `Data Rombel sudah dimiliki oleh ${guruBK} pada semester ini`,
          });
        } catch (queryError) {
          return res.status(409).json({
            error:
              "Data Rombel sudah dimiliki oleh Guru lain pada semester ini",
          });
        }
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getAll(req, res) {
    try {
      const result = await pool.query(
        `SELECT
            id_plotting,
            ptk.nama as nama,
            rombel.nama_rombel as rombel,
            semester.nama_semester as semester
        FROM
            plotting_bk
         LEFT JOIN 
            ptk on ptk.id_ptk = plotting_bk.id_ptk_bk
        LEFT JOIN 
            rombel on rombel.id_rombel = plotting_bk.id_rombel
        LEFT JOIN 
            semester on semester.id_semester = plotting_bk.id_semester
        WHERE 
            ptk.id_jabatan = $1
        ORDER BY rombel.nama_rombel DESC`,
        [21904],
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error " + error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `
        SELECT
            ptk.nama as nama,
            rombel.nama_rombel as rombel,
            semester.nama_semester as semester
        FROM
            plotting_bk
        LEFT JOIN 
            ptk on ptk.id_ptk = plotting_bk.id_ptk_bk
        LEFT JOIN 
            rombel on rombel.id_rombel = plotting_bk.id_rombel
        LEFT JOIN 
            semester on semester.id_semester = plotting_bk.id_semester
        WHERE 
            id_ptk = $1`,
        [id],
      );
      if (result.rows.length === 0)
        return res.status(404).json({ message: "BK tidak ditemukan" });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error " + error.message });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { id_ptk_bk, id_rombel, id_semester } = req.body;

    if (!id_ptk_bk || !id_rombel || !id_semester) {
      return res.status(400).json({
        error: "Data tidak sesuai",
      });
    }

    try {
      const checkJabatan = await pool.query(
        `SELECT id_jabatan FROM ptk WHERE id_ptk = $1`,
        [id_ptk_bk],
      );

      if (checkJabatan.rows.length === 0) {
        return res.status(404).json({ error: "Data Guru tidak ditemukan" });
      }

      if (
        checkJabatan.rows[0].id_jabatan !== "21904" &&
        checkJabatan.rows[0].id_jabatan !== 21904
      ) {
        return res
          .status(403)
          .json({ error: "PTK baru yang dipilih bukan Guru BK" });
      }

      const result = await pool.query(
        `
                UPDATE
                    plotting_bk
                SET
                    id_ptk_bk = $1,
                    id_rombel = $2,
                    id_semester = $3
                WHERE
                    id_plotting = $4
                RETURNING
                    (SELECT nama FROM ptk WHERE id_ptk = $1) as nama,
                    (SELECT nama_rombel FROM rombel WHERE id_rombel = $2) as rombel,
                    (SELECT nama_semester FROM semester WHERE id_semester = $3) as semester
                `,
        [id_ptk_bk, id_rombel, id_semester, id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Data tidak ditemukan",
        });
      }
      res.json({
        message: "Data berhasil di update",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(" Gagal mengupdate data: ", error.message);
      res.status(500).json({ error: "Internal Server Error " + error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `
            DELETE
            FROM
                plotting_bk
            WHERE
                id_plotting = $1
            `,
        [id],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.json({
        message: "Data Berhasil di hapus",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
