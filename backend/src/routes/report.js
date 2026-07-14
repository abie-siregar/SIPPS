const express = require("express");
const router = express.Router();
const printController = require("../controllers/reportController");

router.get("/", printController.PrintReport);

module.exports = router;
