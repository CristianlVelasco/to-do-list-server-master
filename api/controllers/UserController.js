const GlobalController = require("./GlobalController");
const UserDAO = require("../dao/UserDAO");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");

/* Helpers fecha/edad */
function parseISODateUTC(yyyyMmDd) {
  const [y, m, d] = (yyyyMmDd || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}
function isAtLeastYearsOldUTC(birthStr, years = 13) {
  const birth = parseISODateUTC(birthStr);
  if (!birth) return false;
  const now = new Date();
  const cutoff = new Date(
    Date.UTC(
      now.getUTCFullYear() - years,
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );
  return birth <= cutoff;
}

/* Contraseña fuerte: 8+ chars, mayúscula, minúscula, número, símbolo */
const STRONG_PASS_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

class UserController extends GlobalController {
  constructor() {
    super(UserDAO);
    this.userDAO = UserDAO;
  }

  // ========= REGISTER =========
  async register(req, res) {
    try {
      const username = (req.body.username || "").trim();
      const lastname = (req.body.lastname || "").trim();
      const birthdate = (req.body.birthdate || "").trim(); // YYYY-MM-DD
      const emailRaw = (req.body.email || "").trim();
      const password = req.body.password || "";

      const email = emailRaw.toLowerCase();

      if (!username || !lastname || !birthdate || !email || !password) {
        return res
          .status(400)
          .json({ message: "Todos los campos son requeridos" });
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
        return res
          .status(400)
          .json({ message: "Formato de fecha inválido (use YYYY-MM-DD)" });
      }

      if (!isAtLeastYearsOldUTC(birthdate, 13)) {
        return res
          .status(400)
          .json({ message: "Debes tener al menos 13 años" });
      }

      if (!STRONG_PASS_RE.test(password)) {
        return res.status(400).json({
          message:
            "Contraseña no cumple políticas (8+ caracteres, mayúscula, minúscula, número y símbolo)",
        });
      }

      // Buscar email insensible a mayúsculas
      const existing = await User.findOne({
        email: new RegExp(`^${email}$`, "i"),
      });
      if (existing) {
        return res.status(409).json({ message: "El correo ya está registrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let created;
      try {
        created = await this.userDAO.create({
          username,
          lastname,
          birthdate,
          email,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        if (e && e.code === 11000) {
          return res.status(409).json({ message: "El correo ya está registrado" });
        }
        throw e;
      }

      return res.status(201).json({ id: created._id });
    } catch (err) {
      console.error("Register error:", err);
      return res
        .status(500)
        .json({ message: "Error en registro", error: err.message });
    }
  }

  // ========= LOGIN =========
  async login(req, res) {
    try {
      const email = (req.body.email || "").trim().toLowerCase();
      const password = req.body.password || "";

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Faltan email y/o contraseña" });
      }

      const user = await User.findOne({
        email: new RegExp(`^${email}$`, "i"),
      });
      if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }

      const stored = user.password || "";
      const looksHashed = /^\$2[aby]\$/.test(stored);
      const ok = looksHashed
        ? await bcrypt.compare(password, stored)
        : stored === password;

      if (!ok) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || "secreto123",
        { expiresIn: "7d" }
      );

      return res.json({ token });
    } catch (err) {
      console.error("Error login:", err);
      return res
        .status(500)
        .json({ message: "Error en login", error: err.message });
    }
  }

  // ======== FORGOT PASSWORD ========
  async forgotPassword(req, res) {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      // Para no filtrar si existe o no:
      if (!user) {
        return res.status(200).json({ message: "Si el correo está registrado, recibirás un email" });
      }

      // 1) Generar token (15 min)
      const resetToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "secreto123",
        { expiresIn: "15m" }
      );

      // 2) URL al front
      const base = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetUrl = `${base}/reset-password?token=${resetToken}`;

      // 3) ¿Enviar o solo loguear (modo dev)?
      if (String(process.env.SEND_EMAILS).toLowerCase() !== "true") {
        console.log("🔗 RESET URL (dev):", resetUrl);
        return res.json({
          message: "Enlace de recuperación generado (modo dev)",
          resetUrl
        });
      }

      // 4) Transporter SMTP con timeouts y puertos correctos
      const nodemailer = require("nodemailer");
      const port = Number(process.env.SMTP_PORT || 587);
      const secure = port === 465; // 465 es TLS implícito

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // timeouts para evitar cuelgues
        connectionTimeout: 10000, // 10s
        greetingTimeout: 10000,
        socketTimeout: 20000,
      });

      // Prueba de conexión (opcional pero útil)
      await transporter.verify();

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Soporte" <soporte@tuapp.com>',
        to: user.email,
        subject: "Recuperar contraseña",
        html: `
        <p>Has solicitado recuperar tu contraseña.</p>
        <p>Haz click aquí para cambiarla: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>Este enlace expira en 15 minutos.</p>
      `,
      });

      return res.json({ message: "Correo enviado (si el email está registrado)" });
    } catch (err) {
      console.error("❌ forgotPassword error:", err);
      return res.status(500).json({ message: "Error al generar token", error: err.message });
    }
  }

  // ======== RESET PASSWORD ========
  async resetPassword(req, res) {
    const { token, newPassword } = req.body;
    try {
      if (!STRONG_PASS_RE.test(newPassword || "")) {
        return res.status(400).json({
          message:
            "Contraseña no cumple políticas (8+ caracteres, mayúscula, minúscula, número y símbolo)",
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secreto123"
      );

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

      return res.json({ message: "Contraseña actualizada correctamente" });
    } catch (err) {
      console.error("resetPassword error:", err);
      return res
        .status(400)
        .json({ message: "Token inválido o expirado", error: err.message });
    }
  }
}

module.exports = new UserController();
