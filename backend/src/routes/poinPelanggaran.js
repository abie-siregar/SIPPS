// routes/poinPelanggaranRoutes.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

// Import controller functions
const createPoinPelanggaran = require("../controllers/poinPelanggaran/createPoinPelanggaran");
const getListPoinPelanggaran = require("../controllers/poinPelanggaran/getListPoinPelanggaran");
const getPoinPelanggaran = require("../controllers/poinPelanggaran/getPoinPelanggaran");
const updatePoinPelanggaran = require("../controllers/poinPelanggaran/updatePoinPelanggaran");

// Route for Poin Pelanggaran
router.post("/", authenticateToken, createPoinPelanggaran);
router.get("/", authenticateToken, getListPoinPelanggaran);
router.get("/:id_poin", authenticateToken, getPoinPelanggaran);
router.put("/:id_poin", authenticateToken, updatePoinPelanggaran);

module.exports = router;
