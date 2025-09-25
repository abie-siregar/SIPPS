const express = require("express");
const router = express.Router();
const importController = require("../controllers/importController");

// router.post("/", importController.importSiswa);
// router.post("/", importController.importPtk);
router.post("/", importController.importRombel);


module.exports = router;