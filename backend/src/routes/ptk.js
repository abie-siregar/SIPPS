const express = require("express");
const router = express.Router();
const ptkController = require("../controllers/ptkController");

router.post("/", ptkController.getAll);

module.exports = router;