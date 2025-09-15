const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

router.post("/login", (req, res) => UserController.login(req, res));
router.post("/register", (req, res) => UserController.register(req, res));
// Recuperación de contraseña
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);


module.exports = router;
