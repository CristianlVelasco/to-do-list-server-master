const express = require("express");
const router = express.Router();

const UserController = require("../controllers/UserController");

// Auth básicas
router.post("/login", (req, res) => UserController.login(req, res));
router.post("/register", (req, res) => UserController.register(req, res));

// Recuperación de contraseña
router.post("/forgot-password", (req, res) =>
    UserController.forgotPassword(req, res)
);
router.post("/reset-password", (req, res) =>
    UserController.resetPassword(req, res)
);

module.exports = router;
