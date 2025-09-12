const pool = require("../../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  async login(req, res) {
    try {
      const { email, password } = req.body; // gunakan email dari client

      // ambil user berdasarkan email
      const result = await pool.query(
        "SELECT id, email, password_hash FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "User tidak ditemukan" });
      }

      const user = result.rows[0];

      // cek password
      const valid = await bcrypt.compare(password, user.password_hash);
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

  async register(req, res) {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
        [username, hashedPassword]
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
