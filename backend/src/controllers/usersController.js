const pool = require("../../config/database");
const bcrypt = require("bcrypt")

module.exports= {

    //Membuat User baru
async createUser(req, res) {
    try {
      const { username, password, email } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const defaultRole=3
      const result = await pool.query(
        "INSERT INTO users (username, password, role_id, email) VALUES ($1, $2, $3, $4) RETURNING user_id, username",
        [username, hashedPassword, defaultRole, email]
      );

      res
        .status(201)
        .json({ message: "User berhasil dibuat", user: result.rows[0] });
    } catch (error) {
      console.error("Register error:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
    // Mengambil seluruh Data User
    async getAllUser (req, res) {
        try{
            const result = await pool.query("SELECT username, email, role_id FROM users ORDER BY siswa_id ASC");
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({error : "Gagal mengambil data users"});
        }
    },

    // Mengambil data user by ID
    async getByIdUser (req, res) {
        try {
            const {user_id} = req.params;
            const result = await pool.query(
                "SELECT * FROM users WHERE user_id = $1", [user_id]
            );
            if (result.rows.length === 0) return res.status(404).json({message: "User tidak ditemukan"});
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({error: "Internal Server Error"})
        }
    },

    //Update email atau role
    async updateUser(req, res) {
        
        try {
            const {user_id} = req.params;
            const {email, role} = req.body;
            
            let fields = [];
            let values = [];
            let index =1;

            if (email) {
                fields.push (`email = $${index++}`);
                values.push(email);
            }
            if (role) {
                fields.push (`role_id = $${index++}`);
                values.push(role);
            }

            if (fields.length === 0){
                return res.status(500).json({message: " Tidak ada data yang diperbaharui "})
            }

            fields.push(`updated_at = NOW()`);

            const query = `UPDATE users SET ${fields.join(", ")} WHERE id_users = $${index} RETURNING username, email, role, updated_at`;
            values.push(user_id);

            const result = await pool.query(query, values);

            if (result.rows.length === 0) return res.status(404).json({message: "User tidak ditemukan"});
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({error: "Internal Server Error"});
        }
    },

    async deleteUser(req, res) {
        try{
            const {id} = req.params;
            const result = await pool.query(
                "DELETE FROM users WHERE user_id =$1", [id]
            );
            if (result.rowCount === 0){
                return res.status(404).json({message: "Data User tidak ditemukan"})
            }
            res.json({
                message: "Data User berhasil dihapus"
            })
        } catch (error) {
            res.status(500).json({ error: error.message});
        }
    },

        // generate user PTK
    async generateUserPtk(req, res) {
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
  async generateUserSiswa(req, res) {
    try {
      const defaultPassword = "sipps1234siswa"
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const query = `
         INSERT INTO users (
        username,
        email,
        role_id,
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
        6 AS role_id, -- siswa selalu role 6
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