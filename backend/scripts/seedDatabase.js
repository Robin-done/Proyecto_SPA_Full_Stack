import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const seedProducts = [
  {
    name: "Smartphone Premium",
    description: "Último modelo con cámara de 108MP y 5G",
    price: "1199.99",
    originalPrice: "999.99",
    category: "electronics",
    stock: "50",
    brand: "TechBrand",
    features: ["5G", "108MP Camera", "8GB RAM", "256GB Storage"],
    rating: { average: 4.5, count: 120 },
  },
  {
    name: "Laptop Ultadelgada",
    description: "Laptop para trabajo y entretenimiento",
    price: "12999.99",
    originalPrice: "9999.99",
    category: "electronics",
    stock: "25",
    brand: "ComputerPro",
    features: ["Inter i7", "16GB RAM", "1TB SSD", "15.6 Display"],
    rating: { average: 4.3, count: 85 },
  },
];

const seedUsers = [
  {
    name: "Admin User",
    email: "admin@rdgwebmaster.com",
    password: "Robin@1234",
    role: "admin",
  },
  {
    name: "john Doe",
    email: "jdoe@example.com",
    password: "password1234",
    role: "user",
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado a MongoDB");

    //Limpiar coleccion existente
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log("Colecciones Limpias");

    //Isertar datos de prueba
    const products = await Product.insertMany(seedProducts);
    const users = await User.insertMany(seedUsers);

    console.log("Datos de prueba insertados");
    console.log("Datos de productos: " + products.length);
    console.log("Datos de usuario: " + users.length);

    process.exit(0);
  } catch (error) {
    console.error("Error de seeding", error);
    process.exit(1);
  }
};

const currentFile = fileURLToPath(import.meta.url); // convierte a ruta OS
const targetFile = path.resolve(process.argv[1]); // normaliza argv

//Ejecutar solo si se llama directamente
if (currentFile === targetFile) {
  seedDatabase();
}

export { seedDatabase, seedProducts, seedUsers };
