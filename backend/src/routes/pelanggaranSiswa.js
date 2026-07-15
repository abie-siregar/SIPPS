const express = require("express");
const router = express.Router();
const pelanggaranSiswaController = require("../controllers/pelanggaranSiswaController");
const isRoles = require("../middlewares/isRoles");

// semua route sudah otomatis terproteksi lewat index.js
router.post("/", isRoles(["Admin"]), pelanggaranSiswaController.create);
router.get("/", pelanggaranSiswaController.getAll);
router.get("/filter", pelanggaranSiswaController.getFiltered);
router.get("/semesters", pelanggaranSiswaController.getSemesters);
router.get("/:id", pelanggaranSiswaController.getById);
router.put("/:id", isRoles(["Admin"]), pelanggaranSiswaController.update);
router.delete("/:id", isRoles(["Admin"]), pelanggaranSiswaController.delete);

module.exports = router;
