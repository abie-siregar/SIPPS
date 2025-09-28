const express = require("express");
const router = express.Router();
const siswaRoutes = require("../controllers/siswaController");

router.get("/", siswaRoutes.getAll);
router.get("/:siswa_id", siswaRoutes.getById);
router.get("/:id", siswaRoutes.getFiltered);

module.exports = router;
