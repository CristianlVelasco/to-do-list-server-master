const Task = require("../models/task");

/**
 * Crear nueva tarea
 */
exports.create = async (req, res) => {
  try {
    const { title, detail, date, time, status } = req.body;
    const task = new Task({
      title,
      detail,
      date,
      time,
      status,
      user: req.user.id, // viene del authMiddleware
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la tarea", error: error.message });
  }
};

/**
 * Obtener todas las tareas del usuario autenticado
 */
exports.getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tareas", error: error.message });
  }
};

/**
 * Actualizar tarea por ID
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id }, // asegura que sea del usuario
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar tarea", error: error.message });
  }
};

/**
 * Eliminar tarea por ID
 */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json({ message: "Tarea eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar tarea", error: error.message });
  }
};

/**
 * Obtener una tarea por ID
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tarea", error: error.message });
  }
};

