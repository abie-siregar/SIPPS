const pool = require("../../config/database");

const isAdmin = async (req, res, next) => {

  const id_user = req.user?.id;
  if (!id_user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const query = `
      SELECT 
        r.id_role
      FROM 
        users u
      JOIN 
        roles r ON u.id_role = r.id_role
      WHERE 
        u.id_user = $1
    `;
    const { rows } = await pool.query(query, [id_user]);

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
