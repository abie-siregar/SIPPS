const express = require("express");
const router = express.Router();
const poinPelanggaranController = require("../controllers/poinPelanggaranController");
const isRoles = require("../middlewares/isRoles");

// semua route sudah otomatis terproteksi lewat index.js
router.post("/", isRoles(["Admin"]), poinPelanggaranController.create);
router.get("/", poinPelanggaranController.getList);
router.get("/:id_poin", poinPelanggaranController.getById);
router.put(
  "/:id_poin",
  isRoles(["Admin", "BK"]),
  poinPelanggaranController.update
);
router.delete("/:id", isRoles(["Admin"]), poinPelanggaranController.delete);

module.exports = router;
