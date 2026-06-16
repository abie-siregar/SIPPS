const express = require("express");
const router = express.Router();
const rombelController = require("../controllers/rombelController");

router.get("/:id", rombelController.getFiltered);
// router.put("/:id", rombelController.update);
router.get("/", rombelController.getAll);

module.exports = router;
