const express = require("express");
const router = express.Router();
const sanksiController = require("../controllers/sanksiController");
const isRoles = require("../middlewares/isRoles");

router.get("/", sanksiController.getAll);
router.post("/", isRoles(["Admin"]), sanksiController.create);
router.put("/:id", isRoles(["Admin"]), sanksiController.update);
router.delete("/:id", isRoles(["Admin"]), sanksiController.delete);

module.exports = router;
