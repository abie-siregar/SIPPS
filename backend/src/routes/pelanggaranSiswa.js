const express = require("express");
const router = express.Router();
const pelanggaranSiswaController = require("../controllers/pelanggaranSiswaController");
const isRoles = require("../middlewares/isRoles");

// semua route sudah otomatis terproteksi lewat index.js
router.post("/", isRoles(["Admin", "BK"]), pelanggaranSiswaController.create);
router.get("/", pelanggaranSiswaController.getAll);
router.get("/filter", pelanggaranSiswaController.getFiltered);
router.put("/:id", isRoles(["Admin", "BK"]), pelanggaranSiswaController.update);
router.delete("/:id", isRoles(["Admin", "BK"]), pelanggaranSiswaController.delete);

module.exports = router;
