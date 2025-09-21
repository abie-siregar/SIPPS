const express = require("express");
const router = express.Router();
const poinPelanggaranController = require("../controllers/poinPelanggaranController");

// semua route sudah otomatis terproteksi lewat index.js
router.post("/", poinPelanggaranController.create);
router.get("/", poinPelanggaranController.getList);
router.get("/:id_poin", poinPelanggaranController.getById);
router.put("/:id_poin", poinPelanggaranController.update);
router.delete("/:id", poinPelanggaranController.delete);

module.exports = router;
