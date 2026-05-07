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

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener lista de productos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: price-asc, price-desc, name-asc, name-desc, newest, oldest, rating
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Lista de productos paginada
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 products:
 *                   - id: 69c1766bf9435de2cb1a9f57
 *                     name: Laptop Alienware 16
 *                     price: 85000
 *                     category: electronics
 *                     inStock: true
 *                   - id: 69c175d6f9435de2cb1a9f54
 *                     name: Smartphone Premium
 *                     price: 15000
 *                     category: electronics
 *                     inStock: true
 *                 pagination:
 *                   total: 4
 *                   totalPages: 1
 *                   currentPage: 1
 *                   hasNext: false
 *                   hasPrev: false
 */
router.get("/", validateProductQuery, getProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Buscar productos por término
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *         example: laptop
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resultados de búsqueda de productos
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 products:
 *                   - id: 69c17547f9435de2cb1a9f51
 *                     name: Laptop Semi Slim
 *                     category: electronics
 *                   - id: 69a5b00a6d7771cbc9d4a1ce
 *                     name: Smartphone Premium
 *                     category: electronics
 *       400:
 *         description: Parámetros de búsqueda inválidos
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Parámetros de búsqueda inválidos
 *               error: INVALID_QUERY
 */
router.get("/search", validateProductQuery, searchProducts);

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Obtener productos destacados
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos destacados
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 products:
 *                   - id: 69c1766bf9435de2cb1a9f57
 *                     name: Laptop Alienware 16
 *                   - id: 69c175d6f9435de2cb1a9f54
 *                     name: Smartphone Premium
 */
router.get("/featured", getFeaturedProducts);

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Obtener productos por categoría
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         example: electronics
 *     responses:
 *       200:
 *         description: Productos filtrados por categoría
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 products:
 *                   - id: 69c17547f9435de2cb1a9f51
 *                     name: Laptop Semi Slim
 *                     category: electronics
 *       400:
 *         description: Parámetros de búsqueda inválidos
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Parámetros de filtrado inválidos
 *               error: INVALID_QUERY
 *       404:
 *         description: No se encontraron productos en esa categoría
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: No se encontraron productos en esta categoría
 *               error: CATEGORY_NOT_FOUND
 */
router.get("/category/:category", validateProductQuery, getProductByCategory);

/**
 * @swagger
 * /api/products/id/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69c1766bf9435de2cb1a9f57
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 product:
 *                   id: 69c1766bf9435de2cb1a9f57
 *                   name: Laptop Alienware 16
 *                   price: 85000
 *                   category: electronics
 *                   inStock: true
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Producto no encontrado
 *               error: PRODUCT_NOT_FOUND
 */
router.get("/id/:id", validateObjectId, getProductById);

/**
 * @swagger
 * /api/products/sku/{sku}:
 *   get:
 *     summary: Obtener producto por SKU
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         example: ALIENWARE-16-GAMING
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 product:
 *                   id: 69c1766bf9435de2cb1a9f57
 *                   name: Laptop Alienware 16
 *                   sku: ALIENWARE-16-GAMING
 *                   price: 85000
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Producto no encontrado
 *               error: PRODUCT_NOT_FOUND
 */
router.get("/sku/:sku", getProductBySku);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear un nuevo producto (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop Elite 20
 *               description:
 *                 type: string
 *                 example: Laptop de alto rendimiento para juegos
 *               price:
 *                 type: number
 *                 example: 95000
 *               originalPrice:
 *                 type: number
 *                 example: 105000
 *               category:
 *                 type: string
 *                 example: electronics
 *               image:
 *                 type: string
 *                 example: ../../assets/img/product-default.jpg
 *               stock:
 *                 type: integer
 *                 example: 20
 *               sku:
 *                 type: string
 *                 example: ELITE-20-2026
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 69d000000000000000000000
 *                 name: Laptop Elite 20
 *                 category: electronics
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: No autenticado
 *               error: AUTHENTICATION_REQUIRED
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: No tienes permiso para crear productos
 *               error: ADMIN_REQUIRED
 */
router.post("/", authenticateToken, requiredRole(["admin"]), createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar un producto existente (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69c1766bf9435de2cb1a9f57
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop Alienware 16 Plus
 *               description:
 *                 type: string
 *                 example: Laptop mejorado con nuevo sistema de ventilación
 *               price:
 *                 type: number
 *                 example: 87000
 *               originalPrice:
 *                 type: number
 *                 example: 90000
 *               category:
 *                 type: string
 *                 example: electronics
 *               image:
 *                 type: string
 *                 example: ../../assets/img/product-default.jpg
 *               stock:
 *                 type: integer
 *                 example: 18
 *               sku:
 *                 type: string
 *                 example: ALIENWARE-16-GAMING
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Producto actualizado
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: No autenticado
 *               error: AUTHENTICATION_REQUIRED
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: No tienes permiso para actualizar este producto
 *               error: ADMIN_REQUIRED
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Producto no encontrado
 *               error: PRODUCT_NOT_FOUND
 */
router.put(
  "/:id",
  authenticateToken,
  requiredRole(["admin"]),
  validateObjectId,
  updateProduct,
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar un producto (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69c1766bf9435de2cb1a9f57
 *     responses:
 *       200:
 *         description: Producto eliminado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Producto eliminado correctamente
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: No autenticado
 *               error: AUTHENTICATION_REQUIRED
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: No tienes permiso para eliminar este producto
 *               error: ADMIN_REQUIRED
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Producto no encontrado
 *               error: PRODUCT_NOT_FOUND
 */
router.delete(
  "/:id",
  authenticateToken,
  requiredRole(["admin"]),
  validateObjectId,
  deleteProduct,
);

/**
 * @swagger
 * /api/products/info/api:
 *   get:
 *     summary: Información pública de los endpoints de productos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Información de la API de productos
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Informacion del API
 *               endpoints:
 *                 getAll: GET /api/products
 *                 getById: GET /api/products/id/:id
 *                 getBySKU: GET /api/products/sku/:SKU
 *                 search: GET /api/products/search?q=term
 *                 featured: GET /api/products/featured
 *                 byCategory: GET /api/products/category/:category
 *                 create: POST /api/products (admin only)
 *                 update: PUT /api/products/:id (admin only)
 *                 delete: DELETE /api/products/:id (admin only)
 */
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
