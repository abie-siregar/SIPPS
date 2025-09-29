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
            const result = await pool.query(
              `SELECT 
                u.username, 
                u.email, 
                r.role_id_str,
                COALESCE(siswa.nama, ptk.nama) AS nama
              FROM 
                users u
              LEFT JOIN
                roles r ON r.role_id = u.role_id
              LEFT JOIN
                ptk ptk ON ptk.ptk_id_dapodik = u.ptk_id_dapodik
              LEFT JOIN
                siswa siswa ON siswa.siswa_id_dapodik = u.siswa_id_dapodik
              ORDER BY 
                u.user_id 
              ASC`);
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
                `SELECT 
                  u.username, 
                  u.email, 
                  r.role_id_str 
                FROM 
                  users u
                LEFT JOIN
                  roles r ON r.role_id = u.role_id
                WHERE 
                  user_id = $1
                `, [user_id]
            );
            if (result.rows.length === 0) return res.status(404).json({message: "User tidak ditemukan"});
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({error: "Internal Server Error"})
        }
    },

    //Update username, email atau role
    async updateUser(req, res) {
        
        try {
            const {user_id} = req.params;
            const {username, email, role} = req.body;
            
            let fields = [];
            let values = [];
            let index =1;

            if (username) {
                fields.push (`username = $${index++}`);
                values.push(email);
            }
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

            const query = `
            UPDATE 
              users SET ${fields.join(", ")} 
            WHERE 
              user_id = $${index} 
            RETURNING username, email, role_id, updated_at`;
            values.push(user_id);

            const result = await pool.query(query, values);

            if (result.rows.length === 0) return res.status(404).json({message: "User tidak ditemukan"});
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({error: "Internal Server Error"});
        }
    },

    //hapus user
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

};