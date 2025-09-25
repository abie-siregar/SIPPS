const express = require("express");
const router = express.Router();
const siswaRoutes = require("../controllers/siswaController");

router.get("/", siswaRoutes.getAll);
router.get("/:id_poin", siswaRoutes.getById);
router.get("/:id", siswaRoutes.getFiltered);

module.exports = router;
