const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/", notificationController.getMyNotifications);
router.post("/mark-as-read", notificationController.markAsRead);

module.exports = router;
