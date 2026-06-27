const pool = require("../../config/database");
const bcrypt = require("bcrypt");

module.exports = {
  //Membuat User baru
  async createUser(req, res) {
    try {
      const { username, id_role, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);
      const defaultRole = 99;

      const assignedRole =
        id_role !== undefined && id_role !== null ? id_role : defaultRole;

      const result = await pool.query(
        "INSERT INTO users (username, id_role, password) VALUES ($1, $2, $3) RETURNING id_user, username",
        [username, assignedRole, hashedPassword],
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
  async getAllUser(req, res) {
    try {
      const result = await pool.query(
        `SELECT
                u.id_user,
                u.username, 
                r.nama_role,
                COALESCE(siswa.nama, ptk.nama) AS nama
              FROM 
                users u
              LEFT JOIN
                roles r ON r.id_role = u.id_role
              LEFT JOIN
                ptk ptk ON ptk.id_ptk = u.id_ptk
              LEFT JOIN
                siswa siswa ON siswa.id_siswa = u.id_siswa
              ORDER BY 
                u.id_role 
              DESC`,
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: "Gagal mengambil data users" });
    }
  },

  // Mengambil data user by ID
  async getByIdUser(req, res) {
    try {
      const { id } = req.params;
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
                  ptk ptk ON ptk.id_ptk = u.id_ptk
                LEFT JOIN
                  siswa siswa ON siswa.id_siswa = u.id_siswa
                WHERE 
                  id_user = $1
                `,
        [id],
      );
      if (result.rows.length === 0)
        return res.status(404).json({ message: "User tidak ditemukan" });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error " + error.message });
    }
  },

  //Update username, password atau role
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, role, password } = req.body;

      let fields = [];
      let values = [];
      let index = 1;

      if (username) {
        fields.push(`username = $${index++}`);
        values.push(username.trim());
      }

      if (role) {
        fields.push(`id_role = $${index++}`);
        values.push(role);
      }

      if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        fields.push(`password = $${index++}`);
        values.push(hashedPassword);
      }

      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Tidak ada data data baru yang dikirim untuk diperbaharui",
        });
      }

      fields.push(`updated_at = NOW()`);

      const query = `
            UPDATE users u
            SET ${fields.join(", ")}
            FROM roles role
            WHERE u.id_user = $${index} AND u.id_role = role.id_role
            RETURNING id_user, username, role.nama_role, updated_at
        `;

      values.push(id);

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      res.status(200).json({
        success: true,
        message: "Data user berhasil diperbaharui",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error pada fungsi updateUser:", error.message);
      res
        .status(500)
        .json({
          success: false,
          error: "Internal Server Error " + error.message,
        });
    }
  },

  //hapus user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query("DELETE FROM users WHERE id_user =$1", [
        id,
      ]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Data User tidak ditemukan" });
      }
      res.json({
        message: "Data User berhasil dihapus",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
