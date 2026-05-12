import User from "../models/User.js";
import {
  generateToken,
  generateAuthResponse,
  comparePassword,
} from "../utils/authUtils.js";

import { pick } from "../utils/payloadUtils.js";
import {
  validateRegistrationData,
  validateLoginData,
  validateName,
} from "../utils/validationUtils.js";

import { sendVerificationEmail } from "../services/mailerService.js";

import jwt from "jsonwebtoken";

//Registrar nuevo usuario
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //Validar datos de entrada
    const validation = validateRegistrationData({ name, email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Datos de registro inválido",
        errors: validation.errors,
      });
    }

    //Verificar si ya existe el usuario
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "El email ya está registrado",
        error: "EMAIL_ALREADY_EXISTS",
      });
    }
    //Crear nuevo usuario
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: "user",
    });
    await user.save();

    //Generar el TOKEN
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    //Generar ruta de Activacion
    const activationLink = `${process.env.FRONTEND_URL}/activate/${token}`;
    //Enviar verificacion al Email
    await sendVerificationEmail(user, activationLink);

    //Actualizar el ultimo Login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      ...generateAuthResponse(user, token),
      message: "Usuario Registrado. Revisa tu correo para confirmar tu cuenta.",
    });
  } catch (error) {
    console.error("Error en el registro: ", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor durante el registro",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Validar datos de entrada
    const validation = validateLoginData({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Datos del login inválidos",
        errors: validation.errors,
      });
    }

    //Buscar usuarios incluyendo password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválida",
        error: "INVALID_CREDENTIALS",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Cuenta desactivada",
        error: "ACCOUNT_DEACTIVATED",
      });
    }

    //Verificar contraseña
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
        error: "INVALID_CREDENTIALS",
      });
    }

    //Generar Token JWT
    const token = generateToken(user._id, user.role);

    //Actualizar ultimo login
    user.lastLogin = new Date();
    await user.save();

    //Eliminarr password de la ultima respuesta
    user.password = undefined;

    res.status(200).json(generateAuthResponse(user, token));
  } catch (error) {
    console.error("Error en Login", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor durante el login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//Obtener perfil de usuario
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Error obteniendo perfil", error);
    res.status(500).json({
      success: false,
      message: "Error obteniedno el perfil de usuario",
    });
  }
};

//Actalizar perfil de usuario
export const updateProfile = async (req, res) => {
  try {
    const allowedProfileFields = ["name"];
    const update = pick(req.body, allowedProfileFields);

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se encontró ningún campo válido para actualizar",
      });
    }

    if (update.name) {
      const nameError = validateName(update.name);
      if (nameError) {
        return res.status(400).json({
          success: false,
          message: nameError,
        });
      }
      update.name = update.name.trim();
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Perfil actualizado exitosamente",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Error al actualizar el perfil", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el perfil",
    });
  }
};

//Verificar token (Para Frontend)
export const verifyAuth = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Token válido",
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
        valid: true,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token inválido",
      valid: false,
    });
  }
};

//Logout (manejo en frontend, pero se puede invalidar el token si es necesario)
export const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    console.error("Error en logout", error);
    res.status(500).json({
      success: false,
      message: "Error cerrando sesión",
    });
  }
};

//Token de activacion de cuenta
export const resendActivationLink = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }
    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: "La cuenta ya está activada",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const activationLink = `${process.env.FRONTEND_URL}/activate/${token}`;

    await sendVerificationEmail(user, activationLink);

    res.status(200).json({
      success: true,
      message: "Se ha reenviado el enlace de activación",
    });
  } catch (error) {
    console.error("Error al reenviar el enlace", error);
    res.status(500).json({
      success: false,
      message: "Error interno al reenviar el enlace",
    });
  }
};

export const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Buscar usuario
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }
    //Validar si ya esta activo
    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: "La cuenta ya esta activada",
      });
    }

    //Activar la cuenta
    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cuenta activada exitosamente",
    });
  } catch (error) {
    console.error("Error en la activación de la cuenta");
    res.status(400).json({
      success: false,
      message: "Token invalido o expirado",
    });
  }
};
