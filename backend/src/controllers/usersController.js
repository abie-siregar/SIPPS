const pool = require("../../config/database");
const bcrypt = require("bcrypt")

module.exports= {

    //Membuat User baru
async createUser(req, res) {
    try {
      const { username, password, email } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const defaultRole='user'
      const result = await pool.query(
        "INSERT INTO users (username, password_hash, role, email) VALUES ($1, $2, $3, $4) RETURNING id_users, username",
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
            const result = await pool.query("SELECT username, email, role FROM users ORDER BY id_users ASC");
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({error : "Gagal mengambil data users"});
        }
    },

    // Mengambil data user by ID
    async getByIdUser (req, res) {
        try {
            const {id} = req.params;
            const result = await pool.query(
                "SELECT * FROM users WHERE id_users = $1", [id]
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
            const {id} = req.params;
            const {email, role} = req.body;
            
            let fields = [];
            let values = [];
            let index =1;

            if (email) {
                fields.push (`email = $${index++}`);
                values.push(email);
            }
            if (role) {
                fields.push (`role = $${index++}`);
                values.push(role);
            }

            if (fields.length === 0){
                return res.status(500).json({message: " Tidak ada data yang diperbaharui "})
            }

            fields.push(`updated_at = NOW()`);

            const query = `UPDATE users SET ${fields.join(", ")} WHERE id_users = $${index} RETURNING username, email, role, updated_at`;
            values.push(id);

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
                "DELETE FROM users WHERE id_users =$1", [id]
            );
            if (result.rowCount === 0){
                return res.status(404).json({message: "Data user tidak ditemukan"})
            }
            res.json({
                message: "Data User berhasil dihapus"
            })
        } catch (error) {
            res.status(500).json({ error: error.message});
        }
    }
};