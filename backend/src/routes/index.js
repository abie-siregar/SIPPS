const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const authController = require("../controllers/authController");
const isRoles = require("../middlewares/isRoles");

// import route modules
const poinPelanggaranRoutes = require("./poinPelanggaran");
const rombelRoutes = require("./rombel");
const siswaRoutes = require("./siswa");
const ptkRoutes = require("./ptk");
const userRoutes = require("./users");
const pelanggaranRoutes = require("./pelanggaranSiswa");
const importRoutes = require("./import");
const importFileRoutes = require("./importFile");
const generateRoutes = require("./generate");
const sanksiRoutes = require("./sanksi");
const plottingRoutes = require("./plotting");
const pembinaanRoutes = require("./pembinaanSiswa");
const roleRoutes = require("./role");
const OrtuRoutes = require("./OrangtuaWali");
const printRoutes = require("./report");
const notifRoutes = require("./notification");

//  Auth routes (tidak perlu token)
router.post("/auth/login", authController.login);
router.post("/register", authController.register);

//  Protected routes (butuh token)
router.use("/poin-pelanggaran", authenticate, poinPelanggaranRoutes);
router.use(
  "/rombel",
  authenticate,
  isRoles(["Admin", "BK", "Wali Kelas"]),
  rombelRoutes,
);
router.use("/siswa", authenticate, siswaRoutes);
router.use("/ptk", authenticate, isRoles(["Admin"]), ptkRoutes);
router.use("/user", authenticate, isRoles(["Admin"]), userRoutes);
router.use("/pelanggaran-siswa", authenticate, pelanggaranRoutes);
router.use("/pembinaan", authenticate, pembinaanRoutes);
router.use("/import", authenticate, isRoles(["Admin"]), importRoutes);
router.use("/importFile", authenticate, isRoles(["Admin"]), importFileRoutes);
router.use("/generate", authenticate, isRoles(["Admin"]), generateRoutes);
router.use("/sanksi", authenticate, sanksiRoutes);
router.use("/plotting", authenticate, isRoles(["Admin"]), plottingRoutes);
router.use("/role", authenticate, isRoles(["Admin"]), roleRoutes);
router.use("/orangtua", authenticate, OrtuRoutes);
router.use("/print-report", authenticate, printRoutes);
router.use("/notification", authenticate, notifRoutes);
router.get("/auth/profile", authenticate, authController.profile);

module.exports = router;
