const GlobalController = require("./GlobalController");
const UserDAO = require("../dao/UserDAO");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


class UserController extends GlobalController {
  constructor() {
    super(UserDAO);
  }
  async register(req, res) {
    try {
      if (!username || !lastnamen || !age || !email || !password) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }

      // Verificar si ya existe el email
      const existingUser = await this.userDAO.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "El correo ya está registrado" });
      }

      // Crear nuevo usuario
      const newUser = await this.userDAO.create({
        username,
        lastname,
        age,
        email,
        password
      });

      res.status(201).json({ message: "Usuario registrado con éxito", user: newUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const user = await UserDAO.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }

      if (user.password !== password) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "secreto123",
        { expiresIn: "1h" }
      );

      res.json({ token });
    } catch (err) {
      res.status(500).json({ message: "Error en login", error: err.message });
    }
  }
  async forgotPassword(req, res) {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

      // Generar un token de 15 minutos
      const resetToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "secreto123",
        { expiresIn: "15m" }
      );

      // En un proyecto real, aquí se enviaría el token por correo.
      res.json({ message: "Token de recuperación generado", resetToken });
    } catch (err) {
      res.status(500).json({ message: "Error al generar token", error: err.message });
    }
  }
  async resetPassword(req, res) {
    const { token, newPassword } = req.body;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto123");
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
      res.json({ message: "Contraseña actualizada correctamente" });
    } catch (err) {
      res.status(400).json({ message: "Token inválido o expirado", error: err.message });
    }
  }
}

module.exports = new UserController();

