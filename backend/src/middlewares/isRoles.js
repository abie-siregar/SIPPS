const isRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: User tidak ditemukan" });
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res
          .status(403)
          .json({ message: `Forbidden: Role '${userRole}' tidak diizinkan` });
      }

      next();
    } catch (error) {
      console.error("isRoles middleware error:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
};

module.exports = isRoles;
