const express = require("express");
const router = express.Router();
const ptkController = require("../controllers/ptkController");

router.get("/", ptkController.getAll);
router.post("/:id", ptkController.getById);



module.exports = router;