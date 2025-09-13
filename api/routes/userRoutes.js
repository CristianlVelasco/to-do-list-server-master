const express = require("express");
const router = express.Router();
const UserDAO = require("../dao/UserDAO");
const jwt = require("jsonwebtoken");

const UserController = require("../controllers/UserController");

/**
 * @route GET /users
 * @description Retrieve all users.
 * @access Public
 */
router.get("/", (req, res) => UserController.getAll(req, res));

/**
 * @route GET /users/:id
 * @description Retrieve a user by ID.
 * @param {string} id - The unique identifier of the user.
 * @access Public
 */
router.get("/:id", (req, res) => UserController.read(req, res));

/**
 * @route POST /users
 * @description Create a new user.
 * @body {string} username - The username of the user.
 * @body {string} password - The password of the user.
 * @access Public
 */
router.post("/", (req, res) => UserController.create(req, res));
/**
 * @route POST /users/login
 * @description Login de usuario.
 * @body {string} email
 * @body {string} password
 */
// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await UserDAO.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }
  
      // ⚠️ Si usas bcrypt, aquí va la comparación con bcrypt.compare
      if (user.password !== password) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secreto123", {
        expiresIn: "1h",
      });
  
      res.json({ token });
    } catch (err) {
      res.status(500).json({ message: "Error en el servidor", error: err.message });
    }
  });


/**
 * @route PUT /users/:id
 * @description Update an existing user by ID.
 * @param {string} id - The unique identifier of the user.
 * @body {string} [username] - Updated username (optional).
 * @body {string} [password] - Updated password (optional).
 * @access Public
 */
router.put("/:id", (req, res) => UserController.update(req, res));

/**
 * @route DELETE /users/:id
 * @description Delete a user by ID.
 * @param {string} id - The unique identifier of the user.
 * @access Public
 */
router.delete("/:id", (req, res) => UserController.delete(req, res));

/**
 * Export the router instance to be mounted in the main routes file.
 */
module.exports = router;
