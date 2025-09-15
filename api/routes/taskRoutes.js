const express = require("express");
const TaskController = require("../controllers/TaskController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Crear tarea
router.post("/", verifyToken, (req, res) => TaskController.create(req, res));

// Obtener todas las tareas del usuario
router.get("/", verifyToken, (req, res) => TaskController.getUserTasks(req, res));

module.exports = router;
