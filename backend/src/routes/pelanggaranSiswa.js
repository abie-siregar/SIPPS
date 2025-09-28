const express = require("express");
const router = express.Router();
const pelanggaranSiswaController = require("../controllers/pelanggaranSiswaController");

// semua route sudah otomatis terproteksi lewat index.js
router.post("/", pelanggaranSiswaController.create);
router.get("/", pelanggaranSiswaController.getAll);
router.get("/:id", pelanggaranSiswaController.getById);
router.put("/:id", pelanggaranSiswaController.update);
router.delete("/:id", pelanggaranSiswaController.delete);

module.exports = router;
