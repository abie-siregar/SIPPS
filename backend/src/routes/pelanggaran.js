// routes/poinPelanggaranRoutes.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

// Import controller functions
const createPoinPelanggaran = require("../controllers/pelanggaran/createPoinPelanggaran");
const getListPoinPelanggaran = require("../controllers/pelanggaran/getListPoinPelanggaran");
const getPoinPelanggaran = require("../controllers/pelanggaran/getPoinPelanggaran");
const updatePoinPelanggaran = require("../controllers/pelanggaran/updatePoinPelanggaran");

// Route for Poin Pelanggaran
router.post("/", authenticateToken, createPoinPelanggaran);
router.get("/", authenticateToken, getListPoinPelanggaran);
router.get("/:id", authenticateToken, getPoinPelanggaran);
router.put("/:id", authenticateToken, updatePoinPelanggaran);

module.exports = router;
