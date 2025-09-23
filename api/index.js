const express = require("express");
require("dotenv").config();
console.log(">>> ENV MONGO_URI:", process.env.MONGO_URI);

const cors = require("cors");
const { connectDB } = require("./config/database");

const app = express();

/* ===== CORS ===== */
const allowedOrigins = [
    "http://localhost:5173",
    "https://kairo-client-plzzpyyht-norbeyruales-projects.vercel.app" // sin barra final
];
const vercelRegex = /\.vercel\.app$/;

const corsOptions = {
    origin(origin, cb) {
        // permitir herramientas sin origin (curl/Postman/healthchecks)
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin) || vercelRegex.test(origin)) {
            return cb(null, true);
        }
        return cb(new Error("Origin not allowed by CORS: " + origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token", "token"],
    credentials: false, // pon true solo si usas cookies
};

/* ===== Middlewares ===== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aplica CORS a todo
app.use(cors(corsOptions));

// 🔧 FIX Express 5: NO usar app.options("*")
// Responder preflight de forma genérica
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        return res.sendStatus(204); 
    }
    next();
});

/* ===== DB ===== */
connectDB();

/* ===== Rutas ===== */
app.use("/api/v1", require("./routes/routes"));

/* ===== Healthcheck ===== */
app.get("/", (req, res) => res.send("Server is running"));

/* ===== Arranque ===== */
if (require.main === module) {
    const PORT = process.env.PORT || 3000; // Render te inyecta PORT
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;