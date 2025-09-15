const Task = require("../models/task");
const GlobalDAO = require("./GlobalDAO");

class TaskDAO extends GlobalDAO {
  constructor() {
    super(Task);
  }

  static async findByUser(userId) {
    return Task.find({ user: userId });
  }
}

module.exports = new TaskDAO();
