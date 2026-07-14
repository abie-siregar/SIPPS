const pool = require("../../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  // Login
  async login(req, res) {
    try {
      const { username, password } = req.body; // bisa username atau email

      // cari user berdasarkan username/email
      const result = await pool.query(
        `SELECT
          u.id_user, 
          u.username, 
          u.password, 
          r.nama_role 
        FROM users u
        LEFT JOIN roles r ON r.id_role = u.id_role
        WHERE u.username = $1`,
        [username],
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "User tidak ditemukan" });
      }

      const user = result.rows[0];

      // cek password
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Password salah" });
      }

      // buat token JWT dengan role
      const token = jwt.sign(
        {
          id: user.id_user,
          username: user.username,
          role: user.nama_role,
        },
        process.env.JWT_SECRET_KEY || "secret",
        { expiresIn: "1d" },
      );

      res.json({
        message: "Login berhasil",
        token,
        user: {
          id: user.id_user,
          username: user.username,
          role: user.nama_role,
        },
      });
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //Register
  async register(req, res) {
    try {
      const { username, password, id_role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const defaultRole = 3;

      const assignedRole = id_role || defaultRole;

      const result = await pool.query(
        `
        INSERT INTO 
          users 
            (username, password, id_role ) 
        VALUES 
            ($1, $2, $3) 
        RETURNING 
            id_user, 
            username
        `,
        [username, hashedPassword, assignedRole],
      );

      res
        .status(201)
        .json({ message: "User berhasil dibuat", user: result.rows[0] });
    } catch (error) {
      console.error("Register error:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //userInfo
  async profile(req, res) {
    try {
      const { username } = req.user;
      const result = await pool.query(
        `SELECT
          coalesce(u.id_siswa, u.id_orangtua, u.id_ptk) as id,
          u.id_user, 
          u.username,
          r.nama_role AS role,
          COALESCE(siswa.nama, ptk.nama) AS nama,
          COALESCE(siswa.email, ptk.email) AS email,
          COALESCE(siswa.no_telp, ptk.no_telp) AS no_hp
        FROM 
          users u
        LEFT JOIN
          roles r ON r.id_role = u.id_role
        LEFT JOIN
          ptk ptk ON ptk.id_ptk = u.id_ptk
        LEFT JOIN
          siswa siswa ON siswa.id_siswa = u.id_siswa
        WHERE 
          u.username = $1`,
        [username],
      );

      if (result.rows.length === 0)
        return res.status(404).json({ error: "User tidak ditemukan" });

      res.json({ user: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
