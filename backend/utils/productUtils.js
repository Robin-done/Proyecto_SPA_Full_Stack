// Constantes para paginación y ordenamiento
export const PRODUCT_DEFAULT_LIMIT = 10;
export const PRODUCT_MAX_LIMIT = 50;
export const SORT_OPTIONS = {
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "name-asc": { name: 1 },
  "name-desc": { name: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  rating: { "rating.average": -1 },
};

// Validar datos de productos
export const validateProductData = (productData, isUpdate = false) => {
  const errors = {};

  if (!isUpdate || productData.name !== undefined) {
    if (!productData.name || productData.name.trim().length === 0) {
      errors.name = "El nombre del producto es requerido";
    } else if (productData.name.length > 100) {
      errors.name =
        "El nombre del producto no puede exceder los 100 caracteres";
    }
  }

  if (!isUpdate || productData.description !== undefined) {
    if (
      !productData.description ||
      productData.description.trim().length === 0
    ) {
      errors.description = "La descripción es requerida";
    } else if (productData.description.length > 1000) {
      errors.description =
        "La descripción no puede exceder los 1000 caracteres";
    }
  }

  if (!isUpdate || productData.price !== undefined) {
    if (productData.price === undefined || productData.price === null) {
      errors.price = "El precio es requerido";
    } else if (typeof productData.price !== "number" || productData.price < 0) {
      errors.price = "El precio debe ser un número positivo";
    }
  }

  if (!isUpdate || productData.category !== undefined) {
    const validCategories = [
      "electronics",
      "clothing",
      "books",
      "home",
      "sports",
      "other",
    ];
    if (
      productData.category &&
      !validCategories.includes(productData.category)
    ) {
      errors.category = "Categoría no válida";
    }
  }

  if (
    productData.stock !== undefined &&
    (typeof productData.stock !== "number" || productData.stock < 0)
  ) {
    errors.stock = "El stock debe ser un número positivo";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Construir query de productos
export const buildProductQuery = (filters = {}) => {
  let query = { isActive: true };

  if (filters.category && filters.category !== "all") {
    query.category = filters.category;
  }

  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
  }

  if (filters.inStock === "true") {
    query.stock = { $gt: 0 };
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  if (filters.minRating) {
    query["rating.average"] = { $gte: parseFloat(filters.minRating) };
  }

  if (filters.tags) {
    const tagsArray = Array.isArray(filters.tags)
      ? filters.tags
      : [filters.tags];
    query.tags = { $in: tagsArray };
  }

  return query;
};

// Opciones de paginación
export const buildPaginationOptions = (queryParams = {}) => {
  const page = Math.max(1, parseInt(queryParams.page || 1));
  const limit = Math.min(
    PRODUCT_MAX_LIMIT,
    Math.max(1, parseInt(queryParams.limit || PRODUCT_DEFAULT_LIMIT)),
  );
  const skip = (page - 1) * limit;
  const sort = SORT_OPTIONS[queryParams.sort] || { createdAt: -1 };

  return { page, limit, skip, sort };
};

// Metadatos de paginación
export const calculatePaginationMetadata = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    totalPages,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

// Formatear respuesta de productos
export const formatProductResponse = (products, pagination = null) => {
  const response = {
    success: true,
    data: {
      products: products.map((product) => ({
        id: product._id ? String(product._id) : null,
        name: product.name ?? "",
        description: product.description ?? "",
        price: typeof product.price === "number" ? product.price : 0,
        originalPrice:
          typeof product.originalPrice === "number"
            ? product.originalPrice
            : null,
        discountPercentage:
          typeof product.discountPercentage === "number"
            ? product.discountPercentage
            : 0,
        category: product.category ?? "other",
        image: product.image ?? null,
        images: Array.isArray(product.images) ? product.images : [],
        stock: typeof product.stock === "number" ? product.stock : 0,
        inStock: product.stock > 0,
        sku: product.sku ?? null,
        brand: product.brand ?? null,
        rating: {
          average:
            typeof product.rating?.average === "number"
              ? product.rating.average
              : 0,
          count:
            typeof product.rating?.count === "number"
              ? product.rating.count
              : 0,
        },
        features: Array.isArray(product.features) ? product.features : [],
        tags: Array.isArray(product.tags) ? product.tags : [],
        createdAt:
          product.createdAt instanceof Date
            ? product.createdAt.toISOString()
            : typeof product.createdAt === "string"
              ? product.createdAt
              : null,
        updatedAt:
          product.updatedAt instanceof Date
            ? product.updatedAt.toISOString()
            : typeof product.updatedAt === "string"
              ? product.updatedAt
              : null,
        specifications:
          product.specifications instanceof Map
            ? Object.fromEntries(product.specifications)
            : typeof product.specifications === "object" &&
                product.specifications !== null
              ? product.specifications
              : {},
      })),
    },
  };

  if (pagination) {
    response.data.pagination = pagination;
  }
  return response;
};

// Helper para un solo producto
export const formatSingleProductResponse = (product) => {
  return formatProductResponse([product]).data.products[0];
};
