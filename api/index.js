const express = require("express");
require("dotenv").config();
console.log(">>> ENV MONGO_URI:", process.env.MONGO_URI);

const cors = require("cors");
const routes = require("./routes/routes.js");
const { connectDB } = require("./config/database");

const app = express();

/* ===== CORS: orígenes permitidos ===== */
const allowedOrigins = [
    "http://localhost:5173", // Vite local
    "https://kairo-client-plzzpyyht-norbeyruales-projects.vercel.app" // SIN barra final
];
// permitir cualquier *.vercel.app (previews)
const vercelRegex = /\.vercel\.app$/;

const corsOptions = {
    origin(origin, cb) {
        // permitir herramientas sin Origin (curl/Postman/Render healthchecks)
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

// aplicar CORS a todo
app.use(cors(corsOptions));
// responder explícitamente preflights con headers CORS
app.options("*", cors(corsOptions));

/* ===== DB ===== */
connectDB();

/* ===== Rutas ===== */
app.use("/api/v1", require("./routes/routes"));

/* ===== Healthcheck ===== */
app.get("/", (req, res) => res.send("Server is running"));

/* ===== Arranque ===== */
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
