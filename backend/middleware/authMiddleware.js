const jwt = require("jsonwebtoken");

/**
 * Middleware untuk memverifikasi JWT token pada header Authorization
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Format header: "Bearer <token>"
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Simpan payload token ke req.user
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

module.exports = authenticateToken;
