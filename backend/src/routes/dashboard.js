const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/analytics", dashboardController.analytics);

module.exports = router;
