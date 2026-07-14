const express = require("express");
const router = express.Router();
const pembinaanSiswa = require("../controllers/pembinaanController");
const isRoles = require("../middlewares/isRoles");

router.get("/", pembinaanSiswa.getAll);
router.get(
  "/stepper/:id",
  isRoles(["BK", "Admin", "Wali Kelas"]),
  pembinaanSiswa.getDetailStepper,
);
router.post("/next-step", isRoles(["BK", "Admin"]), pembinaanSiswa.nextStep);
module.exports = router;
