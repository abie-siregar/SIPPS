const express = require("express");
const router = express.Router();
const siswaRoutes = require("../controllers/siswaController");

router.get("/", siswaRoutes.getAll);
router.post("/:id", siswaRoutes.getById);
router.put("/:id", siswaRoutes.update);
router.get("/filter", siswaRoutes.getFiltered);

module.exports = router;
