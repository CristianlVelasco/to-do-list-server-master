const TaskDAO = require("../dao/TaskDAO");

class TaskController {

  static async create(req, res) {
    try {
      let { title, detail, status, date, time, dueAt } = req.body;
      const userId = req.user.id; // del JWT

      // 1) Normaliza status si viene del front en inglés
      const statusMap = { todo: "pendiente", doing: "en progreso", done: "completada" };
      if (status && statusMap[status]) status = statusMap[status];

      // 2) Aceptar dueAt ("YYYY-MM-DDTHH:mm") o {date,time}
      let finalDate = date || null;
      let finalTime = time || null;

      if (!finalDate || !finalTime) {
        if (typeof dueAt === "string") {
          const [d, t] = dueAt.split("T");
          finalDate = finalDate || d || null;
          finalTime = finalTime || (t ? t.slice(0, 5) : null); // HH:mm
        }
      }

      // 3) Validación mínima
      if (!title || !finalDate || !finalTime || !status) {
        return res.status(400).json({ message: "Faltan campos: title, date, time, status" });
      }

      const newTask = await TaskDAO.create({
        title,
        detail: detail || "",
        date: finalDate,
        time: finalTime,
        status,
        user: userId,
      });

      return res.status(201).json(newTask);
    } catch (err) {
      return res.status(500).json({ message: "Error al crear tarea", error: err.message });
    }
  }
  static async getUserTasks(req, res) {
    try {
      const userId = req.user.id;
      const tasks = await TaskDAO.findByUser(userId); // ahora sí existe y ordena bien
      return res.json(tasks);
    } catch (err) {
      return res.status(500).json({ message: "Error al obtener tareas", error: err.message });
    }
  }
}

module.exports = TaskController;
