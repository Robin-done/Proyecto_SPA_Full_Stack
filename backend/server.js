import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import database from "./config/database.js";
import { requestLogger, errorLogger } from "./middleware/logger.js";

//Import Rutas
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";

//Variable de Entorno
dotenv.config();

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SPA API",
      version: "1.0.0",
      description: "API para la Single Page Application",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // Archivos donde están las rutas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

//Crear App Express
const app = express();

//Seguridad básica
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Demasiadas solicitudes desde esta IP, por favor intenta más tarde.",
});
app.use(limiter);

// Documentación Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Middleware esencial
app.use(requestLogger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

//Configurar Cors
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-Requested-With"],
  }),
);

(async () => {
  await database.connect(); // esperar a que termine
  console.log("DB Status:", database.getStatus());

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log("Servidor iniciado en puerto", PORT);
  });
})();

//Verificar conexion a la base de datos
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

//Rutas Principales
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Endpoint de prueba funcionando",
    date: {
      version: "1.0.0",
      autor: "Robin D.G.",
      Description: "Backend para SAP React",
    },
  });
});

app.use(errorLogger);

//Middleware del Loggin para Desarrollo
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

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

//Manejo de graceful de Shutdown
process.on("SIGINT", () => {
  console.log("Apagando servidor por Gracefulmente..");
  process.exit(0);
});

export default app;
