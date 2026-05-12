import mongoose from "mongoose";
import dotenv from "dotenv";

//Cargar variables de entorno
dotenv.config();

// Mongoose security hardening
mongoose.set("strictQuery", true);
mongoose.set("sanitizeFilter", true);

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const options = {
        maxPoolSize: 10, //Maximo de Conexion simultaneas
        serverSelectionTimeoutMS: 5000, //Servidor
        socketTimeoutMS: 4500, //Inactividad
        family: 4, //IPv4
      };

      console.log("Intentando Conectar a MongoDb Atlas...");

      this.connection = await mongoose.connect(
        process.env.MONGODB_URI,
        options,
      );
    } catch (error) {
      console.error("Error conectando a MongoDB: ", error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        console.log("Desconectado de MongoDB Atlas");
      }
    } catch (error) {
      console.error("Error al deconectar de MongoDB: ", error.message);
    }
  }

  getConnection() {
    return this.connection;
  }

  getStatus() {
    if (!this.connection) {
      return {
        connected: false,
        state: "uninitialized",
        dbName: null,
        host: null,
        port: null,
      };
    }

    const conn = this.connection.connection;

    return {
      connected: conn.readyState === 1,
      state: this.getStateString(conn.readyState),
      dbName: conn.name,
      host: conn.host,
      port: conn.port,
    };
  }

  getStateString(state) {
    const states = {
      0: "disconnect",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
      99: "uninitialized",
    };
    return states[state] || "unknown";
  }
}

//Manejo de eventos de conexion
mongoose.connection.on("connected", () => {
  console.log("Mongoose Conectado a MongoDB Atlas");
});

mongoose.connection.on("error", (err) => {
  console.error("Error de conexion de Mongoose:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose desconectado de MongoDB");
});

//Manejar cieere de graceful de la aplicacion
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Conexion a MongoDB cerrada por terminacion de app");
  process.exit(0);
});

//Crear y exportar instancia unica de Database
const database = new Database();
export default database;
