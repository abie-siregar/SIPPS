const express = require("express");
const router = express.Router();
const generateRoutes = require("../controllers/generateController");


router.post("/ptk", generateRoutes.ptk); // Generate user ptk
router.post("/siswa", generateRoutes.siswa); // Generate user Siswa

module.exports = router;