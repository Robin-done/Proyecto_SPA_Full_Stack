import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del producto es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    description: {
      type: String,
      required: [true, "La descripcion es requerida"],
      maxlength: [5000, "La descripción no pued exceder los 1000 caracteres"],
    },
    price: {
      type: Number,
      required: [true, "El precio es requerido"],
      min: [0, "El precio no puede ser negativo"],
    },
    originalPrice: {
      type: Number,
      min: [0, "El precio original no puede ser negativo"],
    },
    category: {
      type: String,
      required: [true, "La categoría es requerida"],
      enum: ["electronics", "clothing", "books", "home", "sports", "other"],
    },
    image: {
      type: String,
      default: "../../assets/img/product-default.jpg",
    },
    images: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      required: true,
      min: [0, "El stock no puede ser negativo"],
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    features: [
      {
        type: String,
      },
    ],
    specifications: {
      type: Map,
      of: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//Virtual para descuento porcentual
productSchema.virtual("discountPercentage").get(function () {
  const price = typeof this.price === "number" ? this.price : 0;
  const originalPrice =
    typeof this.originalPrice === "number" ? this.originalPrice : 0;
  if (originalPrice > price && originalPrice > 0) {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }
  return 0;
});

//Virtual para inStock
productSchema.virtual("inStock").get(function () {
  return Number(this.stock) > 0;
});

//Indes para busquedas eficientes
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ "rating.average": -1 });

//Metodo Estatico para productos activos
productSchema.statics.getActiveProducts = function () {
  return this.find({ isActive: true });
};

const Product = mongoose.model("Product", productSchema);
export default Product;
