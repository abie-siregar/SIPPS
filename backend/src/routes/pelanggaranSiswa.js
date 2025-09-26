const express = require("express");
const router = express.Router();
const pelanggaranSiswaController = require("../controllers/pelanggaranSiswaController");

// semua route sudah otomatis terproteksi lewat index.js
router.post("/", pelanggaranSiswaController.create);
router.get("/", pelanggaranSiswaController.getList);
router.get("/:id_poin", pelanggaranSiswaController.getById);
router.put("/:id_poin", pelanggaranSiswaController.update);
router.delete("/:id", pelanggaranSiswaController.delete);

module.exports = router;
