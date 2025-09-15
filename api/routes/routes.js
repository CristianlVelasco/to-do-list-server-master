const express = require("express");
const router = express.Router();
const taskRoutes = require("./taskRoutes");



// Usuarios
router.use("/users", require("./userRoutes"));

//Tareas
router.use("/tasks", taskRoutes);

// Autenticación
router.use("/auth", require("./authRoutes")); 

module.exports = router;
