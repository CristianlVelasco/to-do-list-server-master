const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    detail: {
      type: String,
      trim: true,
    },
    date: {
      type: String, // formato YYYY-MM-DD
      required: true,
    },
    time: {
      type: String, // formato HH:mm
      required: true,
    },
    status: {
      type: String,
      enum: ["pendiente", "en progreso", "completada"],
      default: "pendiente",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Relación con el usuario dueño de la tarea
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
