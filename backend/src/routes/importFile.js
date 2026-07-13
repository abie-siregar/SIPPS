const express = require("express");
const router = express.Router();
const multer = require("multer");
const importFileController = require("../controllers/importFileController");
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/pelanggaran",
  upload.single("file"),
  importFileController.importPelanggaran,
);
router.post("/iptk", upload.single("file"), importFileController.importPTK);
router.post(
  "/irombel",
  upload.single("file"),
  importFileController.importRombel,
);
router.post("/isiswa", upload.single("file"), importFileController.importSiswa);

module.exports = router;
