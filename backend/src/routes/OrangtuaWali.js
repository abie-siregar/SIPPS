const express = require("express");
const router = express.Router();
const OrtuController = require("../controllers/OrtuWaliController");

router.post("/:id", OrtuController.getById); // Get Data Orangtua by id siswa
router.post("/:id", OrtuController.getMyChildren); // Get Data Anak
router.put("/:id", OrtuController.update); // Update Insert Data Orangtua by id_siswa
router.get("/all", OrtuController.getAll); // Get All Data Orangtua
module.exports = router;
