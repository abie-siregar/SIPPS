// src/routes/rombel.js
const express = require("express");
const router = express.Router();

// Import controller functions
const getListRombel = require("../controllers/rombel/getListRombel");
const getRombel = require("../controllers/rombel/getRombel");
const updateRombel = require("../controllers/rombel/updateRombel");

// Route: POST /api/rombel
router.post("/", getListRombel);

// Route: GET /api/rombel/:id
router.get("/:id", getRombel);

// Route: PUT /api/rombel/:id
router.put("/:id", updateRombel);

module.exports = router;
