const pool = require("../../config/database");

const isAdmin = async (req, res, next) => {

  const user_id = req.user?.id;
  if (!user_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const query = `
      SELECT 
        r.role_id
      FROM 
        users u
      JOIN 
        roles r ON u.role_id = r.role_id
      WHERE 
        u.user_id = $1
    `;
    const { rows } = await pool.query(query, [user_id]);

    const isAdmin = rows.some((role) => role.name === "Admin");

    if (!isAdmin) {
      return res.status(403).json({ error: "Akses ditolak ! Admin Only" });
    }

    next();
  } catch (err) {
    console.error("Error checking admin role:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = isAdmin;
