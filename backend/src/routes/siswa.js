const express = require("express");
const router = express.Router();
const siswaRoutes = require("../controllers/siswaController");

router.get("/", siswaRoutes.getAll);

module.exports = router;
