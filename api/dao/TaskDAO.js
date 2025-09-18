const Task = require("../models/Task");
const GlobalDAO = require("./GlobalDAO");

class TaskDAO extends GlobalDAO {
  constructor() {
    super(Task);
  }

  async findByUser(userId) {
    // Orden en la QUERY:
    return Task.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
  }
}

module.exports = new TaskDAO();
