const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TaskController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, TaskController.create);

// Crear tarea
router.post("/create", authMiddleware, TaskController.create);

// Obtener tareas del usuario
router.get("/", authMiddleware, TaskController.getUserTasks);



module.exports = router;
