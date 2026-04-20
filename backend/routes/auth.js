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

//Rutas  Pública
router.post("/register", register);
router.post("/login", login);
router.get("/verify", optionalAuth, verifyAuth);

// Reenvío de enlace de activación
router.post("/resend-activation", resendActivationLink);

// Activación de cuenta con token
router.get("/activate/:token", activateAccount);

//Rutas protegidas (Req Auth)
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.post("/logout", authenticateToken, logout);

//Ruta de información pública
router.get("/info", (req, res) => {
  res.status(200).json({
    success: true,
    messaage: "Auth API funcionando correctamente",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      profile: "GET /api/auth/profile",
      verify: "GET /api/auth/verify",
    },
    security: {
      type: "JWT",
      algoritm: "HS256",
    },
  });
});

export default router;
