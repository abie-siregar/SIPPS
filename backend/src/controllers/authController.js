const pool = require("../../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  async login(req, res) {
    try {
      const { username, password } = req.body; // bisa username atau email

      // cari user berdasarkan username/email
      const result = await pool.query(
        `SELECT
          u.user_id, 
          u.username, 
          u.email, 
          u.password, 
          u.no_hp,
          COALESCE (p.nama, s.nama) AS nama,
          r.role_id_str 
        FROM users u
        LEFT JOIN roles r ON r.role_id = u.role_id
        LEFT JOIN ptk p ON p.ptk_id_dapodik = u.ptk_id_dapodik
        LEFT JOIN siswa s ON s.siswa_id_dapodik = u.siswa_id_dapodik
        WHERE u.username = $1 OR u.email = $1`,
        [username]
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
          id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role_id_str,
        },
        process.env.JWT_SECRET_KEY || "secret",
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login berhasil",
        token,
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
          nama: user.nama,
          no_hp: user.no_hp,
          role: user.role_id_str,
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
      const { username, password, email } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const defaultRole = 3;
      const result = await pool.query(
        `
        INSERT INTO 
          users 
            (username, password, role_id, email) 
        VALUES 
            ($1, $2, $3, $4) 
        RETURNING 
            user_id, 
            username, 
            email
        `,
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

  //userInfo
  async profile(req, res) {
    try {
      const { username, email } = req.user;
      const result = await pool.query(
        `SELECT
          u.user_id, u.username, u.email, u.alamat,
          r.role_id_str AS role,
          COALESCE(s.nama, p.nama) AS nama,
          COALESCE(s.nomor_telepon_rumah, u.no_telepon ) AS no_telepon,
          COALESCE(s.nomor_telepon_seluler, u.no_hp) AS no_hp
        FROM 
          users u
        LEFT JOIN
          roles r ON r.role_id = u.role_id
        LEFT JOIN
          siswa s ON s.siswa_id_dapodik = u.siswa_id_dapodik
        LEFT JOIN
          ptk p ON p.ptk_id_dapodik = u.ptk_id_dapodik
        WHERE 
          u.username = $1 OR u.email = $1`,
        [username || email]
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
