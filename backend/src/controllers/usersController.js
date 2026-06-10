const pool = require("../../config/database");
const bcrypt = require("bcrypt")

module.exports= {

    //Membuat User baru
    async createUser(req, res) {
    try {
      const { username, id_role, password } = req.body;

      console.log("Data dari Postman:", req.body);

      const hashedPassword = await bcrypt.hash(password, 10);
      const defaultRole= 1; // Role default jika id_role tidak diberikan

      const assignedRole = (id_role !== undefined && id_role !== null) ? id_role : defaultRole;

      const result = await pool.query(
        "INSERT INTO users (username, id_role, password) VALUES ($1, $2, $3) RETURNING id_user, username", 
        [username, assignedRole, hashedPassword ]
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
                r.nama_role,
                COALESCE(siswa.nama, ptk.nama) AS nama
              FROM 
                users u
              LEFT JOIN
                roles r ON r.id_role = u.id_role
              LEFT JOIN
                ptk ptk ON ptk.ptk_id_dapodik = u.ptk_id_dapodik
              LEFT JOIN
                siswa siswa ON siswa.siswa_id_dapodik = u.siswa_id_dapodik
              ORDER BY 
                u.id_user 
              ASC`);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({error : "Gagal mengambil data users"});
        }
    },

    // Mengambil data user by ID
    async getByIdUser (req, res) {
        try {
            const {id_user} = req.params;
            const result = await pool.query(
                `SELECT 
                  u.username, 
                  r.nama_role 
                FROM 
                  users u
                LEFT JOIN
                  roles r ON r.id_role = u.id_role
                WHERE 
                  id_user = $1
                `, [id_user]
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
            const {id_user} = req.params;
            const {username, role} = req.body;
            
            let fields = [];
            let values = [];
            let index =1;

            if (username) {
                fields.push (`username = $${index++}`);
                values.push(username);
            }
            if (role) {
                fields.push (`id_role = $${index++}`);
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
              id_user = $${index} 
            RETURNING username, id_role, updated_at`;
            values.push(id_user);

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
                "DELETE FROM users WHERE id_user =$1", [id]
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