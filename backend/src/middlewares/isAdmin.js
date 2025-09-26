const pool = require("../../config/database");

const isAdmin = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const query = `
      SELECT roles.name
      FROM users
      JOIN roles ON users.role_id = roles.role_id
      WHERE users.user_id = $1
    `;
    const { rows } = await pool.query(query, [userId]);

    const isAdmin = rows.some((role) => role.name === "Admin");

    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden: Admin only" });
    }

    next();
  } catch (err) {
    console.error("Error checking admin role:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = isAdmin;
