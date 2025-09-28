const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.post("/create", usersController.createUser); // Create New Users
router.post("/:id", usersController.getByIdUser); // Get Users by id
router.put("/:id", usersController.updateUser); // Update User by id
router.get("/all", usersController.getAllUser); // Get All Users
router.delete("/:id", usersController.deleteUser); // Delete User by id
module.exports = router;
