const express = require("express");
const router = express.Router();
const ptkController = require("../controllers/ptkController");

// router.post("/", ptkController.getAll);
router.post("/", ptkController.getEverything);

module.exports = router;