import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
      minlength: [2, "El nombre debe de tener al menos 2 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Por favor ingresa un email válido",
      ],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [15, "El número de teléfono no puede exceder 15 caracteres"],
      match: [/^[0-9]{10}$/, "Por favor ingresa un número de teléfono válido"],
    },
    subject: {
      type: String,
      required: [true, "El asunto es requerido"],
      trim: true,
      maxlength: [100, "El asunto no puede exceder 100 caracteres"],
      minlength: [5, "El asunto debe de tener al menos 5 caracteres"],
    },
    message: {
      type: String,
      required: [true, "El mensaje es requerido"],
      trim: true,
      maxlength: [2000, "El mensaje no puede exceder 2000 caracteres"],
      minlength: [10, "El mensaje debe de tener al menos 10 caracteres"],
    },
    category: {
      type: String,
      required: [true, "La categoría es requerida"],
      enum: {
        values: [
          "general",
          "support",
          "sales",
          "technical",
          "complaint",
          "feedback",
        ],
        message: "La categoría no es válida",
      },
      default: "general",
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved", "closed"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    response: {
      type: String,
      trim: true,
      maxlength: [2000, "La respuesta no puede exceder 2000 caracteres"],
    },
    respondeby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    respondedAt: Date,
    assigndTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//Virtual para identificar la hora de creacion
contactMessageSchema.virtual("ageInHours").get(function () {
  return Math.floor(Date.now() - this.createdAt) / (1000 * 60 * 60); // Convertir a horas
});

// Virtual para saber si tiene una respuesta
contactMessageSchema.virtual("hasResponse").get(function () {
  return !!this.response && !!this.respondeby.message; // Retorna true si hay respuesta y quien respondió
});

// Indices para mejorar performance
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ status: 1 });
contactMessageSchema.index({ category: 1 });
contactMessageSchema.index({ priority: 1 });
contactMessageSchema.index({ createdAt: -1 });

contactMessageSchema.static.getRecentMessages = function (days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    createdAt: { $gte: startDate },
  })
    .sort({ createdAt: -1 })
    .limit(50);
};

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
export default ContactMessage;
