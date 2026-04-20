import express from "express";
import {
  getProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductByCategory,
  searchProducts,
  getFeaturedProducts,
} from "../controllers/productController.js";
import {
  authenticateToken,
  requiredRole,
} from "../middleware/authMiddleware.js";

import {
  validateObjectId,
  validateProductQuery,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

//Rutas públicas
router.get("/", validateProductQuery, getProducts);
router.get("/search", validateProductQuery, searchProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", validateProductQuery, getProductByCategory);
router.get("/id/:id", validateObjectId, getProductById);
router.get("/sku/:sku", getProductBySku);

//Rutas protegidas (Solo admin)
router.post("/", authenticateToken, requiredRole(["admin"]), createProduct);
router.put(
  "/:id",
  authenticateToken,
  requiredRole(["admin"]),
  validateObjectId,
  updateProduct,
);
router.delete(
  "/:id",
  authenticateToken,
  requiredRole(["admin"]),
  validateObjectId,
  deleteProduct,
);

//Ruta de iformación del API
router.get("/info/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Informacion del API",
    endpoints: {
      getAll: "GET /api/products",
      getById: "GET /api/products/id/:id",
      getBySKU: "GET /api/products/sku/:SKU",
      search: "GET /api/products/search?q=term",
      featured: "GET /api/products/featured",
      byCategory: "GET /api/products/category/:category",
      create: "POST /api/products (admin only)",
      update: "PUT /api/products/:id (admin only)",
      delete: "DELETE /api/products/:id (admin only)",
    },
    queryParameters: {
      page: "Número de página",
      limit: "Items por página (max 50)",
      sort: "price-asc, price-desc, name-asc, name-desc, newest, oldest, rating",
      category: "Filtrar por categoría",
      minPrice: "Precio minimo",
      maxPrice: "Precio maximo",
      inStock: "true/false para filtrar stock",
      minRating: "Rating minimo (1-5)",
    },
  });
});

export default router;
