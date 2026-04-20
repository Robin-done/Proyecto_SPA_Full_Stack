import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ✅  Comparar al Password
export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

//Generar JWT
export const generateToken = (userId, role = "user") => {
  return jwt.sign(
    {
      userId,
      role,
      iss: "spa-backend",
      aud: "spa-frontend",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "24h",
      algorithm: "HS256",
    },
  );
};

//Verificar Token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch (error) {
    throw new Error("Token inválido o expirado");
  }
};

// Hashear Contraseña
export const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

// Extraer token de Headers
export const extractTokenFromHeaders = (authHeader) => {
  if (!authHeader) {
    throw new Error("Autorization header required");
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new Error("Autorization header format: Bearer <token>");
  }
  return parts[1];
};

//Respuesta de Autentificacion estandar
export const generateAuthResponse = (user, token) => {
  return {
    success: true,
    message: "Autentificación exitosa",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lasLogin: user.lastLogin,
      },
      token,
      expiresIn: process.env.JWT_EXPIRE || "24h",
    },
  };
};
