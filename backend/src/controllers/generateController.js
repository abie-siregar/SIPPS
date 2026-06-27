const pool = require("../../config/database");
const bcrypt = require("bcrypt")

module.exports= {

    // generate user PTK
    async ptk(req, res) {
    try {
        
      const defaultPassword = "sipps@1234ptk"
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const query = `
        INSERT INTO users (id_role, id_ptk, username,  password,  is_active)
        SELECT DISTINCT ON (p.id_ptk)
        CASE 
        WHEN p.id_jabatan = 10001 THEN 101
        WHEN p.id_jabatan = 21904 THEN 102
        WHEN r.id_ptk_wali IS NOT NULL THEN 103
        WHEN CAST (p.id_jabatan AS TEXT) LIKE '2%' THEN 2
        ELSE 3
        END AS id_role,
        p.id_ptk,
        TRIM(p.email) AS username,
        $1 AS password,
        true AS is_active
        FROM ptk p
        LEFT JOIN rombel r ON p.id_ptk = r.id_ptk_wali
        WHERE p.email IS NOT NULL AND TRIM(p.email) != ''
        ORDER BY p.id_ptk, r.id_rombel ASC
        ON CONFLICT (username) DO UPDATE SET
        id_role = EXCLUDED.id_role,
        id_ptk = EXCLUDED.id_ptk,
        is_active = EXCLUDED.is_active
        RETURNING *;
      `;

      const { rows } = await pool.query(query, [hashedPassword]);

      res.json({ message: "Users PTK berhasil digenerate", inserted: rows.length, data: rows });
    } catch (error) {
      console.error("Gagal generate user PTK:", error.message);
      res.status(500).json({ error: "Gagal generate user PTK: " + error.message });
    }
    },

    // Generate user dari Siswa
    async siswa(req, res) {
    try {
      const defaultPassword = "sipps@1234siswa"
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const query = `
        INSERT INTO 
          users (
            id_role,
            id_siswa,
            username,
            password,
            is_active
          )
      SELECT 
        6 AS id_role,
        s.id_siswa,
        s.nisn AS username,
        $1 AS password,
        true as is_active
      FROM siswa s
      WHERE s.nisn IS NOT NULL AND s.nisn != ''
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `;

      const { rows } = await pool.query(query, [hashedPassword]);

      res.json({ message: "Users Siswa berhasil digenerate", inserted: rows.length, data: rows });
    } catch (error) {
      console.error("Gagal generate user Siswa:", error.message);
      res.status(500).json({ error: "Gagal generate user Siswa: " + error.message });
    }
  },
};