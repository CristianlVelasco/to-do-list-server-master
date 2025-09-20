const GlobalController = require("./GlobalController");
const UserDAO = require("../dao/UserDAO");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // ✅ agregado
const User = require("../models/User");

class UserController extends GlobalController {
  constructor() {
    super(UserDAO);
    this.userDAO = UserDAO; // ✅ asegurar referencia
  }

  // =============================
  // REGISTRO
  // =============================
async register(req, res) {
  try {
    const username  = (req.body.username  || '').trim();
    const lastname  = (req.body.lastname  || '').trim();
    const birthdate = (req.body.birthdate || '').trim();     // esperado YYYY-MM-DD
    const emailRaw  = (req.body.email     || '').trim();
    const password  = (req.body.password  || '');

    // normaliza email a minúsculas
    const email = emailRaw.toLowerCase();

    if (!username || !lastname || !birthdate || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // validación simple de fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      return res.status(400).json({ message: "Formato de fecha inválido (use YYYY-MM-DD)" });
    }

    // ¿email ya existe? (insensible a mayúsculas)
    const existing = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (existing) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // crear usuario
    const created = await this.userDAO.create({
      username,
      lastname,
      birthdate,
      email,
      password: hashedPassword,
    });

    // responde solo datos seguros
    return res.status(201).json({
      message: "Usuario registrado con éxito",
      user: {
        id: created._id,
        username: created.username,
        email: created.email,
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: err.message });
  }
}

  // =============================
  // LOGIN
  // =============================
  async login(req, res) {
    try {
      const email = (req.body.email || '').trim().toLowerCase();
      const password = req.body.password || '';

      if (!email || !password) {
        return res.status(400).json({ message: "Faltan email y/o contraseña" });
      }

      // 🔎 BÚSQUEDA INSENSIBLE A MAYÚSCULAS
      // (evita "Usuario no encontrado" si se guardó con otra capitalización)
      const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

      if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }

      // Soporte hash/plain
      const stored = user.password || '';
      const looksHashed = /^\$2[aby]\$/.test(stored);
      const ok = looksHashed ? (await bcrypt.compare(password, stored)) : (stored === password);

      if (!ok) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || "secreto123",
        { expiresIn: "7d" }
      );

      // 👇 Log útil mientras depuramos
      console.log("✅ Login OK para:", user.email);

      return res.json({ token });
    } catch (err) {
      console.error("❌ Error login:", err);
      return res.status(500).json({ message: "Error en login", error: err.message });
    }
  }

  // =============================
  // FORGOT PASSWORD
  // =============================
  async forgotPassword(req, res) {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // 👇 mejor no revelar si existe o no
        return res.status(200).json({ message: "Si el correo está registrado, recibirás un email" });
      }
  
      // Generar un token válido por 15 minutos
      const resetToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "secreto123",
        { expiresIn: "15m" }
      );
  
      // Link que irá al frontend
      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
  
      // Configuración de transporte (SMTP real o Mailtrap)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
  
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Soporte" <soporte@tuapp.com>',
        to: user.email,
        subject: "Recuperar contraseña",
        html: `
          <p>Has solicitado recuperar tu contraseña.</p>
          <p>Haz click aquí para cambiarla: <a href="${resetUrl}">${resetUrl}</a></p>
          <p>Este enlace expira en 15 minutos.</p>
        `
      });
  
      res.json({ message: "Correo enviado (si el email está registrado)" });
    } catch (err) {
      res.status(500).json({ message: "Error al generar token", error: err.message });
    }
  }

  // =============================
  // RESET PASSWORD
  // =============================
  async resetPassword(req, res) {
    const { token, newPassword } = req.body;
    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto123");
  
      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Actualizar usuario
      await User.findByIdAndUpdate(decoded.id, {
        password: hashedPassword
      });
  
      res.json({ message: "Contraseña actualizada correctamente" });
    } catch (err) {
      res.status(400).json({ message: "Token inválido o expirado", error: err.message });
    }
  }
  
}

module.exports = new UserController();
