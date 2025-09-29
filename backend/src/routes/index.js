const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const authController = require("../controllers/authController");

// import route modules
const poinPelanggaranRoutes = require("./poinPelanggaran");
const rombelRoutes = require("./rombel");
const siswaRoutes = require("./siswa");
const ptkRoutes = require("./ptk");
const userRoutes = require("./users");
const pelanggaranRoutes = require("./pelanggaranSiswa")
const importRoutes = require("./import")
const generateRoutes = require("./generate")

// 🔓 Auth routes (tidak perlu token)
router.post("/auth/login", authController.login);
router.post("/register", authController.register);

// 🔒 Protected routes (butuh token)
router.use("/poin-pelanggaran", authenticate, poinPelanggaranRoutes);
router.use("/rombel", authenticate, rombelRoutes);
router.use("/siswa", authenticate, siswaRoutes);
router.use("/ptk", authenticate, ptkRoutes);
router.use("/user", authenticate, userRoutes);
router.use("/pelanggaran-siswa", authenticate, pelanggaranRoutes);
router.use("/import", authenticate, importRoutes);
router.use("/generate", authenticate, generateRoutes );
router.get("/auth/profile", authenticate, authController.profile );

module.exports = router;
