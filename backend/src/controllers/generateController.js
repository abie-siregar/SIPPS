const pool = require("../../config/database");
const bcrypt = require("bcrypt")

module.exports= {

    // generate user PTK
    async ptk(req, res) {
    try {
        
      const defaultPassword = "sipps1234"
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const query = `
        INSERT INTO users (username, email, role_id, password, alamat, ptk_id_dapodik, is_active)
        SELECT 
            p.nuptk AS username,
            p.email,
            CASE 
                WHEN p.jenis_ptk_id = 92 THEN 2
                WHEN p.jenis_ptk_id = 93 THEN 3
                WHEN r.rombel_id IS NOT NULL THEN 4
                ELSE 99
            END AS role_id,
            $1 AS password,
            p.alamat as alamat,
            p.ptk_id_dapodik,
            true
        FROM ptk p
        LEFT JOIN rombel r ON p.ptk_id_dapodik = r.ptk_id_dapodik
        WHERE p.email IS NOT NULL
        ON CONFLICT (ptk_id_dapodik) DO NOTHING
        RETURNING *;
      `;

      const { rows } = await pool.query(query, [hashedPassword]);

      res.json({ message: "Users PTK berhasil digenerate", inserted: rows.length, data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal generate user PTK" });
    }
    },

    // Generate user dari Siswa
    async siswa(req, res) {
    try {
      const defaultPassword = "sipps1234siswa"
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const query = `
        INSERT INTO 
          users (
            username,
            email,
            id_role,
            password,
            alamat,
            no_telepon,
            no_hp,
            siswa_id_dapodik,
            is_active
          )
      SELECT 
        s.nisn AS username,
        COALESCE(s.email, s.nisn || '@sipps.com') AS email, -- jika email null, gunakan nisn@sipps.com
        6 AS id_role, -- siswa selalu role 6
        $1 AS password,
        s.alamat AS alamat,
        s.nomor_telepon_rumah AS no_telepon,
        s.nomor_telepon_seluler AS no_hp,   
        s.siswa_id_dapodik,
        true
      FROM siswa s
      ON CONFLICT (siswa_id_dapodik) DO NOTHING
      RETURNING *;
    `;

      const { rows } = await pool.query(query, [hashedPassword]);

      res.json({ message: "Users Siswa berhasil digenerate", inserted: rows.length, data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal generate user Siswa" });
    }
  },
};