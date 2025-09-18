const express = require("express");
const router = express.Router();
const rombelController = require("../controllers/rombelController");

// router.post("/", rombelController.getList);
router.get("/:id", rombelController.getById);
router.put("/:id", rombelController.update);
router.get("/", rombelController.getAll);

module.exports = router;
