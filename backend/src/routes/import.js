const express = require("express");
const router = express.Router();
const importController = require("../controllers/importController");

router.post("/siswa", importController.importSiswa);
router.post("/ptk", importController.importPtk);
router.post("/rombel", importController.importRombel);
router.post("/update", importController.importPengguna);


module.exports = router;