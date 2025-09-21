const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.post("/", usersController.createUser); // Create New Users
router.get("/", usersController.getAllUser); // Get All Users
router.post("/:id", usersController.getByIdUser); // Get Users by id
router.put("/:id", usersController.updateUser); // Update User


module.exports = router;
