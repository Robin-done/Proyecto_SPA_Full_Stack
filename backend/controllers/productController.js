import Product from "../models/Product.js";
import {
  buildProductQuery,
  buildPaginationOptions,
  calculatePaginationMetadata,
  formatProductResponse,
  formatSingleProductResponse,
} from "../utils/productUtils.js";
import { pick } from "../utils/payloadUtils.js";

import mongoose from "mongoose";

// Listar productos con filtros, paginación y ordenamiento
export const getProducts = async (req, res) => {
  try {
    // Construir query y opciones de paginación
    const query = buildProductQuery(req.query);
    const { page, limit, skip, sort } = buildPaginationOptions(req.query);

    // Ejecutar consulta y contar documentos en paralelo
    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    // Calcular metadatos de paginación
    const pagination = calculatePaginationMetadata(total, page, limit);

    // Formatear respuesta
    const response = formatProductResponse(products, pagination);

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error en getProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los productos",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//Obtener producto por ID

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    }

    return res.status(200).json({
      success: true,
      data: { product: formatSingleProductResponse(product) },
    });
  } catch (error) {
    console.error("Error en getProductById:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error al obtener producto" });
  }
};

export const getProductBySku = async (req, res) => {
  try {
    const { sku } = req.params;

    const product = await Product.findOne({ sku }).lean();

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    }

    return res.status(200).json({
      success: true,
      data: { product: formatSingleProductResponse(product) },
    });
  } catch (error) {
    console.error("Error en getProductBySku:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error al obtener producto" });
  }
};

//Crear Nuevo Producto (admin)
export const createProduct = async (req, res) => {
  try {
    const allowedProductFields = [
      "name",
      "description",
      "price",
      "category",
      "stock",
      "sku",
      "brand",
      "image",
      "images",
      "tags",
      "features",
      "specifications",
      "originalPrice",
      "discountPercentage",
    ];

    const productData = pick(req.body, allowedProductFields);
    const validation = validateProductData(productData);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Datos del producto inválidos",
        errors: validation.errors,
      });
    }

    if (!productData.sku) {
      const baseSku = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|$)/g, "")
        .substring(0, 20);
      const count = await Product.countDocuments({
        sku: new RegExp(`^${baseSku}`),
      });
      productData.sku = count > 0 ? `${baseSku}-${count + 1}` : baseSku;
    }
    const product = new Product(productData);
    await product.save();
    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      data: { product: formatSingleProductResponse(product) },
    });
  } catch (error) {
    console.error("Error creando el producto", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "El SKU del producto ya existe",
        error: "DUPLICATE_SKU",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error al crear el producto",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//Actualizar productos (admin)
export const updateProduct = async (req, res) => {
  try {
    const allowedProductFields = [
      "name",
      "description",
      "price",
      "category",
      "stock",
      "sku",
      "brand",
      "image",
      "images",
      "tags",
      "features",
      "specifications",
      "originalPrice",
      "discountPercentage",
    ];

    const updateFields = pick(req.body, allowedProductFields);
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se encontró ningún campo válido para actualizar",
      });
    }

    const validation = validateProductData(updateFields, true);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Datos del producto inválidos",
        errors: validation.errors,
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true,
        context: "query",
      },
    ).lean();

    res.status(200).json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: { product: formatSingleProductResponse(product) },
    });
  } catch (error) {
    console.error("Error al actualziar el producto", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "IDdel producto no válido",
      });
    }

    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: "El SKU del producto no existe",
        error: "DUPLICATE_SKU",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al actualziar el producto",
    });
  }
};

//Eliminar producto
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id, {
      isActive: false,
    });

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    res
      .status(200)
      .json({ success: true, message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando producto", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "ID de producto no válido",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al elminar el producto",
    });
  }
};

//Obtener productos por categoría (publico)
export const getProductByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const query = buildProductQuery({ ...req.query, category });
    const { page, limit, skip, sort } = buildPaginationOptions(req.query);

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    const pagination = calculatePaginationMetadata(total, page, limit);
    res.status(200).json({
      ...formatProductResponse(products, pagination),
      category: category,
    });
  } catch (error) {
    console.error("Error obteniendo productos por categoría", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos por categoría",
    });
  }
};

//Buscar productos (publico)
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Término de busqueda requerido",
      });
    }

    const query = buildProductQuery({ ...req.query, search: q });
    const { page, limit, skip, sort } = buildPaginationOptions(req.query);

    const [product, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);
    const pagination = calculatePaginationMetadata(total, page, limit);

    res.status(200).json({
      ...formatProductResponse(product, pagination),
      searchTerm: q,
      resultsCount: total,
    });
  } catch (error) {
    console.error("Error buscando productos", error);
    res.status(500).json({
      success: false,
      message: "Error al buscar productos",
    });
  }
};

// Obtener productos destacados (Publico)

export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Math.min(8, parseInt(req.query.limit) || 4);
    const products = await Product.find({
      isActive: true,
      "rating.average": { $gte: 4.0 },
    })
      .sort({ "rating.average": -1, "rating.count": -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        products: formatProductResponse(products).data.products,
        featured: true,
      },
    });
  } catch (error) {
    console.error("Error obteniendo productos destacados", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo productos destacados",
    });
  }
};
