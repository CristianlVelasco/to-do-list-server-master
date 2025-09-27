const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const authMiddleware = require("../middlewares/authMiddleware");




// GET /users/profile
router.get("/profile", authMiddleware, (req, res) => UserController.readProfile(req, res));

// PUT /users/profile
router.put("/profile", authMiddleware, (req, res) => UserController.updateProfile(req, res));
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
 * @description Create a new user (registro).
 * @body {string} username
 * @body {string} lastname
 * @body {string} birthdate
 * @body {string} email
 * @body {string} password
 * @access Public
 */
router.post("/", (req, res) => UserController.register(req, res));

/**
 * @route POST /users/login
 * @description Login de usuario.
 * @body {string} email
 * @body {string} password
 * @access Public
 */
router.post("/login", (req, res) => UserController.login(req, res));

/**
 * @route POST /users/forgot-password
 * @description Enviar token de recuperación.
 * @body {string} email
 * @access Public
 */
router.post("/forgot-password", (req, res) => UserController.forgotPassword(req, res));

/**
 * @route POST /users/reset-password
 * @description Resetear contraseña con token.
 * @body {string} token
 * @body {string} newPassword
 * @access Public
 */
router.post("/reset-password", (req, res) => UserController.resetPassword(req, res));

/**
 * @route PUT /users/:id
 * @description Update an existing user by ID.
 * @param {string} id
 * @access Public
 */
router.put("/:id", (req, res) => UserController.update(req, res));

/**
 * @route DELETE /users/:id
 * @description Delete a user by ID.
 * @param {string} id
 * @access Public
 */
router.delete("/:id", (req, res) => UserController.delete(req, res));

/**
 * Export the router instance to be mounted in the main routes file.
 */

module.exports = router;
