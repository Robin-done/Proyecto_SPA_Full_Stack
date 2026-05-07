import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  verifyAuth,
  resendActivationLink,
  activateAccount,
} from "../controllers/authController.js";
import {
  authenticateToken,
  optionalAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan.perez@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Usuario Registrado. Revisa tu correo para confirmar tu cuenta.
 *               data:
 *                 user:
 *                   id: 69fcdf591d322c3eb7ab0b3d
 *                   name: Juan Pérez
 *                   email: juan.perez@example.com
 *                   role: user
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn: 30m
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Datos de registro inválido
 *               errors:
 *                 name: Nombre solo puede contener letras y espacios
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: El email ya está registrado
 *               error: EMAIL_ALREADY_EXISTS
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan.perez@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Login exitoso
 *               data:
 *                 user:
 *                   id: 69fcdf591d322c3eb7ab0b3d
 *                   name: Juan Pérez
 *                   email: juan.perez@example.com
 *                   role: user
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn: 30m
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Credenciales inválidas
 *               error: INVALID_CREDENTIALS
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar token JWT opcional
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido o sesión opcional reconocida
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Token válido
 *               user:
 *                 id: 69fcdf591d322c3eb7ab0b3d
 *                 email: juan.perez@example.com
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Token inválido
 *               error: INVALID_TOKEN
 */
router.get("/verify", optionalAuth, verifyAuth);

/**
 * @swagger
 * /api/auth/resend-activation:
 *   post:
 *     summary: Reenviar enlace de activación por correo
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan.perez@example.com
 *     responses:
 *       200:
 *         description: Enlace de activación reenviado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Enlace de activación enviado al correo
 *       400:
 *         description: Email inválido
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Email inválido
 *               error: INVALID_EMAIL
 */
router.post("/resend-activation", resendActivationLink);

/**
 * @swagger
 * /api/auth/activate/{token}:
 *   get:
 *     summary: Activar cuenta usando token de activación
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         example: abc123def456
 *     responses:
 *       200:
 *         description: Cuenta activada correctamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Cuenta activada correctamente
 *       400:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Token inválido o expirado
 *               error: INVALID_ACTIVATION_TOKEN
 */
router.get("/activate/:token", activateAccount);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 69fcdf591d322c3eb7ab0b3d
 *                 name: Juan Pérez
 *                 email: juan.perez@example.com
 *                 role: user
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: No autenticado
 *               error: AUTHENTICATION_REQUIRED
 */
router.get("/profile", authenticateToken, getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Actualizar perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez Actualizado
 *               email:
 *                 type: string
 *                 example: juan.perez@example.com
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Perfil actualizado
 *               data:
 *                 id: 69fcdf591d322c3eb7ab0b3d
 *                 name: Juan Pérez Actualizado
 *                 email: juan.perez@example.com
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Datos de actualización inválidos
 *               errors:
 *                 email: Email inválido
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: No autenticado
 *               error: AUTHENTICATION_REQUIRED
 */
router.put("/profile", authenticateToken, updateProfile);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Usuario desconectado exitosamente
 *       401:
 *         description: No autenticado
 */
router.post("/logout", authenticateToken, logout);

/**
 * @swagger
 * /api/auth/info:
 *   get:
 *     summary: Información pública de los endpoints de autenticación
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Información de los endpoints
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Auth API funcionando correctamente
 *               endpoints:
 *                 register: POST /api/auth/register
 *                 login: POST /api/auth/login
 *                 profile: GET /api/auth/profile
 *                 verify: GET /api/auth/verify
 *               security:
 *                 type: JWT
 *                 algorithm: HS256
 */
router.get("/info", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth API funcionando correctamente",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      profile: "GET /api/auth/profile",
      verify: "GET /api/auth/verify",
    },
    security: {
      type: "JWT",
      algorithm: "HS256",
    },
  });
});

export default router;
