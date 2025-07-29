// src/routes/rombel.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

// Import controller functions
const getListRombel = require("../controllers/rombel/getListRombel");
const getRombel = require("../controllers/rombel/getRombel");
const updateRombel = require("../controllers/rombel/updateRombel");

// Route: POST /api/rombel
router.post("/", authenticateToken, getListRombel);

// Route: GET /api/rombel/:id
router.get("/:id", authenticateToken, getRombel);

// Route: PUT /api/rombel/:id
router.put("/:id", authenticateToken, updateRombel);

module.exports = router;
