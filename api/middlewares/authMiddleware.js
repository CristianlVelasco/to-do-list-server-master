const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Aceptar 'authorization' o 'Authorization'
  const authHeader = req.headers.authorization || req.headers.Authorization;

  let token = null;

  // Soporta "Bearer xxx" o el token "pelado" en Authorization
  if (authHeader && typeof authHeader === "string") {
    token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
  }

  // Fallbacks compatibles
  if (!token) token = req.headers["x-auth-token"] || req.headers["token"];

  if (!token) {
    return res.status(403).json({ message: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto123");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = authMiddleware;
