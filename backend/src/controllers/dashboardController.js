const pool = require("../../config/database");

const dashboardController = {
  async analytics(req, res) {
    const userId = req.user?.id;
    const roleName = req.user?.role;
    const { jenis_penilaian } = req.query;

    try {
      if (roleName === "Admin") {
        // Fetch all categories for filter
        const categoriesDb = await pool.query(
          "SELECT DISTINCT jenis_penilaian FROM poin_pelanggaran WHERE jenis_penilaian IS NOT NULL ORDER BY jenis_penilaian ASC"
        );
        const categories = categoriesDb.rows.map((row) => row.jenis_penilaian);

        // Fetch students with accumulated points
        const studentsDb = await pool.query(
          `SELECT 
            s.id_siswa,
            s.nama,
            r.nama_rombel,
            COALESCE(SUM(pp.bobot), 0)::integer as total_poin
          FROM 
            siswa s
          LEFT JOIN 
            anggota_rombel ar ON ar.id_siswa = s.id_siswa
          LEFT JOIN 
            rombel r ON r.id_rombel = ar.id_rombel
          INNER JOIN 
            pelanggaran_siswa ps ON ps.id_siswa = s.id_siswa
          INNER JOIN 
            poin_pelanggaran pp ON pp.id_poin = ps.id_poin
          WHERE 
            $1::text IS NULL OR pp.jenis_penilaian = $1
          GROUP BY 
            s.id_siswa, s.nama, r.nama_rombel
          ORDER BY 
            total_poin DESC
          LIMIT 10`,
          [jenis_penilaian || null]
        );

        const violationsDb = await pool.query(
          `SELECT 
            pp.jenis_pelanggaran,
            COUNT(DISTINCT ps.id_siswa)::integer as count
          FROM 
            pelanggaran_siswa ps
          INNER JOIN 
            poin_pelanggaran pp ON pp.id_poin = ps.id_poin
          GROUP BY 
            pp.jenis_pelanggaran
          ORDER BY 
            count DESC
          LIMIT 5`
        );

        // Fetch daily violation trends
        const trendsDb = await pool.query(
          `SELECT 
            TO_CHAR(ps.tanggal AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') as tanggal_pelanggaran,
            COUNT(ps.id_pelanggaran)::integer as count
          FROM 
            pelanggaran_siswa ps
          GROUP BY 
            tanggal_pelanggaran
          ORDER BY 
            tanggal_pelanggaran ASC
          LIMIT 30`
        );

        return res.json({
          role: "Admin",
          categories,
          data: studentsDb.rows,
          violations: violationsDb.rows,
          trends: trendsDb.rows,
        });
      } else if (roleName === "Guru" || roleName === "BK" || roleName === "Wali Kelas") {
        // Fetch id_ptk first
        const userDb = await pool.query(
          "SELECT id_ptk FROM users WHERE id_user = $1",
          [userId]
        );

        if (userDb.rows.length === 0 || !userDb.rows[0].id_ptk) {
          return res.json({
            role: roleName,
            data: [],
          });
        }

        const id_ptk = userDb.rows[0].id_ptk;

        // Fetch rombel info based on role
        let rombelName = null;
        let rombelNames = [];

        if (roleName === "Guru" || roleName === "Wali Kelas") {
          const rombelDb = await pool.query(
            "SELECT nama_rombel FROM rombel WHERE id_ptk_wali = $1 LIMIT 1",
            [id_ptk]
          );
          rombelName = rombelDb.rows[0]?.nama_rombel || null;
        } else if (roleName === "BK") {
          const rombelsDb = await pool.query(
            `SELECT r.nama_rombel FROM rombel r 
             INNER JOIN plotting_bk pbk ON pbk.id_rombel = r.id_rombel 
             WHERE pbk.id_ptk_bk = $1 
             ORDER BY r.nama_rombel ASC`,
            [id_ptk]
          );
          rombelNames = rombelsDb.rows.map(row => row.nama_rombel);
        }

        // Fetch students in rombel where user is Wali or BK
        const studentsDb = await pool.query(
          `SELECT 
            s.id_siswa,
            s.nama,
            r.nama_rombel,
            COALESCE(SUM(pp.bobot), 0)::integer as total_poin
          FROM 
            siswa s
          INNER JOIN 
            anggota_rombel ar ON ar.id_siswa = s.id_siswa
          INNER JOIN 
            rombel r ON r.id_rombel = ar.id_rombel
          LEFT JOIN 
            plotting_bk pbk ON pbk.id_rombel = r.id_rombel
          INNER JOIN 
            pelanggaran_siswa ps ON ps.id_siswa = s.id_siswa
          INNER JOIN 
            poin_pelanggaran pp ON pp.id_poin = ps.id_poin
          WHERE 
            r.id_ptk_wali = $1 OR pbk.id_ptk_bk = $1
          GROUP BY 
            s.id_siswa, s.nama, r.nama_rombel
          ORDER BY 
            total_poin DESC
          LIMIT 10`,
          [id_ptk]
        );

        // Fetch top 8 types of violations for rombel
        const violationsDb = await pool.query(
          `SELECT 
            pp.jenis_pelanggaran,
            COUNT(DISTINCT ps.id_siswa)::integer as count
          FROM 
            pelanggaran_siswa ps
          INNER JOIN 
            poin_pelanggaran pp ON pp.id_poin = ps.id_poin
          INNER JOIN
            siswa s ON s.id_siswa = ps.id_siswa
          INNER JOIN
            anggota_rombel ar ON ar.id_siswa = s.id_siswa
          INNER JOIN
            rombel r ON r.id_rombel = ar.id_rombel
          LEFT JOIN
            plotting_bk pbk ON pbk.id_rombel = r.id_rombel
          WHERE 
            r.id_ptk_wali = $1 OR pbk.id_ptk_bk = $1
          GROUP BY 
            pp.jenis_pelanggaran
          ORDER BY 
            count DESC
          LIMIT 5`,
          [id_ptk]
        );

        // Fetch daily violation trends for rombel
        const trendsDb = await pool.query(
          `SELECT 
            TO_CHAR(ps.tanggal AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') as tanggal_pelanggaran,
            COUNT(ps.id_pelanggaran)::integer as count
          FROM 
            pelanggaran_siswa ps
          INNER JOIN
            siswa s ON s.id_siswa = ps.id_siswa
          INNER JOIN
            anggota_rombel ar ON ar.id_siswa = s.id_siswa
          INNER JOIN
            rombel r ON r.id_rombel = ar.id_rombel
          LEFT JOIN
            plotting_bk pbk ON pbk.id_rombel = r.id_rombel
          WHERE 
            r.id_ptk_wali = $1 OR pbk.id_ptk_bk = $1
          GROUP BY 
            tanggal_pelanggaran
          ORDER BY 
            tanggal_pelanggaran ASC
          LIMIT 30`,
          [id_ptk]
        );

        return res.json({
          role: roleName,
          rombelName,
          rombelNames,
          data: studentsDb.rows,
          violations: violationsDb.rows,
          trends: trendsDb.rows,
        });
      } else {
        return res.json({
          role: roleName,
          data: [],
        });
      }
    } catch (error) {
      console.error("Dashboard Analytics Error:", error.message);
      res.status(500).json({ error: "Internal Server Error: " + error.message });
    }
  },
};

module.exports = dashboardController;
