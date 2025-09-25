const pool = require("../../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  async login(req, res) {
    try {
      const { email, password } = req.body; // gunakan email dari client

      // ambil user berdasarkan email
      const result = await pool.query(
        "SELECT user_id, email, password FROM users WHERE email = $1",
        [email]
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

      // buat token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email }, // simpan email di token
        process.env.JWT_SECRET_KEY || "secret",
        { expiresIn: "1d" }
      );

      res.json({ token });
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //Register
  async register(req, res) {
    try {
      const { user_id, username, password, email } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const defaultRole=3
      const result = await pool.query(
        "INSERT INTO users (user_id, username, password, role_id, email) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, email",
        [user_id, username, hashedPassword, defaultRole, email]
      );

      res
        .status(201)
        .json({ message: "User berhasil dibuat", user: result.rows[0] });
    } catch (error) {
      console.error("Register error:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
