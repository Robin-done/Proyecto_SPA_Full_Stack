import { verifyToken, extractTokenFromHeaders } from "../utils/authUtils.js";
import User from "../models/User.js";

//Middleware para verificar JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeaders(authHeader);

    const decode = verifyToken(token);

    //Verificar que el usuario aun existe
    const user = await User.findById(decode.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado - Token inválido ",
      });
    }
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Cuenta desactivada",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error de autenticación", error.message);
    return res.status(401).json({
      success: false,
      message: "No autorizado - Token inválido",
      error: error.message,
    });
  }
};

//Middleware oara verificar roles
export const requiredRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Autenticación requerida",
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Permisos insuficientes para esta acción",
      });
    }
    next();
  };
};

//Middleware de autentificacion para rutas (publicas/pribadas)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const token = extractTokenFromHeaders(authHeader);
    const decode = verifyToken(token);

    const user = await User.findById(decode.userId).select("-password");

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    //Si hay error en el token, continua sin autenticación
    next();
  }
};
