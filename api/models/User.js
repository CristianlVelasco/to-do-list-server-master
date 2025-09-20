const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    birthdate: { type: Date, required: true }, // Fecha de nacimiento
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String }, // guardaremos SHA256(token)
    resetPasswordExpires: { type: Date },
  },
  
  { timestamps: true }
);

UserSchema.methods.comparePassword = (candidate, hash) => bcrypt.compare(candidate, hash);


module.exports = mongoose.model("User", UserSchema);
