const express = require("express");
const router = express.Router();
const plottingController = require("../controllers/plottingController");
const isRoles = require("../middlewares/isRoles");

router.post("/", isRoles(["Admin"]), plottingController.add);
router.get("/", plottingController.getAll);
router.post("/:id", isRoles(["Admin"]), plottingController.getById);
router.put("/:id", isRoles(["Admin"]), plottingController.update);
router.delete("/:id", isRoles(["Admin"]), plottingController.delete);

module.exports = router;
