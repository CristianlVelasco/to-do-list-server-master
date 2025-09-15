const TaskDAO = require("../dao/TaskDAO");

class TaskController {
  static async create(req, res) {
    try {
      const { title, detail, date, time, status } = req.body;
      const userId = req.user.id; // Viene del token JWT decodificado

      const newTask = await TaskDAO.create({
        title,
        detail,
        date,
        time,
        status,
        user: userId,
      });

      res.status(201).json(newTask);
    } catch (err) {
      res.status(500).json({ message: "Error al crear tarea", error: err.message });
    }
  }

  static async getUserTasks(req, res) {
    try {
      const userId = req.user.id;
      const tasks = await TaskDAO.findByUser(userId);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener tareas", error: err.message });
    }
  }
}

module.exports = TaskController;
