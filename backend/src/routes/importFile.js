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

module.exports = router;
