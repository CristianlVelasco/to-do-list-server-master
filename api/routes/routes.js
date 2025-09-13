const express = require("express");
const router = express.Router();

// Usuarios
router.use("/users", require("./userRoutes"));

// Autenticación
router.use("/auth", require("./authRoutes")); // 👈 importante

module.exports = router;
