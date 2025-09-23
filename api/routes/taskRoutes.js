const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TaskController");
const authMiddleware = require("../middlewares/authMiddleware");

// Crear tarea
router.post("/", authMiddleware, TaskController.create);

// Obtener todas las tareas del usuario
router.get("/", authMiddleware, TaskController.getUserTasks);

// Actualizar tarea
router.put("/:id", authMiddleware, TaskController.update);

// Eliminar tarea
router.delete("/:id", authMiddleware, TaskController.remove);

router.get("/:id", authMiddleware, TaskController.getById);   // <-- NUEVA


module.exports = router;
