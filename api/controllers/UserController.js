const GlobalController = require("./GlobalController");
const UserDAO = require("../dao/UserDAO");
const jwt = require("jsonwebtoken");

class UserController extends GlobalController {
  constructor() {
    super(UserDAO);
  }
  async register(req, res) {
    try {
      if (!username || !email || !password) {
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
}

module.exports = new UserController();

