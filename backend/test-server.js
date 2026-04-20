import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import database from "./config/database.js";
import { requestLogger, errorLogger } from "./middleware/logger.js";

//Modelo de Conexion
import "./models/User.js";
import "./models/Product.js";

//Rutas
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";

//Variable de Entorno
dotenv.config();

//Crear App Express
const app = express();

//Verificar conexion a la base de datos al iniciar
app.use((req, res, next) => {
  const dbStatus = database.getStatus();
  if (!dbStatus.connected) {
    return res.status(503).json({
      success: false,
      message: "Servicio no disponibe - Base de datos desconectada",
      error: "database_connection_error",
    });
  }
  next();
});

//Ruta para verificar estado de la BD
app.get("/api/db-status", (req, res) => {
  const status = database.getStatus();
  res.status(200).json({
    success: true,
    database: status,
  });
});

//Middleware esencial
app.use(requestLogger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

//Configurar Cors para Desarrollo
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-Requested-With"],
  }),
);

app.use(errorLogger);

//Middleware del Loggin para Desarrollo
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

//Routes Basico de Salud y Prueba
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Servidor funcionando correctamente",
    timeStamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Endpoint de prueba funcionando",
    date: {
      version: "1.0.0",
      autor: "Robin D.G.",
      Description: "Backend para SAP React - Lab 6",
    },
  });
});

//Rutas Principales
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

//Manejo de rutas no encontradas(404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
    suggestion: "Verificar la URL o Consulta la Documentación del API",
  });
});

//Middleware de manejo de errores globales
app.use((error, req, res, next) => {
  console.log("Error: ", error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

//Obtener el puerto desde la variable de entorno
const PORT = process.env.PORT || 5000;

//Iniciar Servidor
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("Backend Server iniciado exitosamente!");
  console.log("Información del Servidor");
  console.log("-> Entorno: " + process.env.NODE_ENV);
  console.log("-> Puerto: " + PORT);
  console.log("=".repeat(50) + "\n");
});

//Manejo de graceful de Shutdown
process.on("SIGINT", () => {
  console.log("Apagando servidor por Gracefulmente..");
  process.exit(0);
});

export default app;
