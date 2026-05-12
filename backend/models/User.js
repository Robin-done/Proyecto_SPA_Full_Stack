import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [8, "La contraseña debe de tener al menos 8 caracteres"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, //Crea createdAt y updatedAt automaticamente
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//Middleware pre-save para hashear password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(
    Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  );
  this.password = await bcrypt.hash(this.password, salt);
});

//Metodo para comparar Password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

//Virtual para nombre completo
userSchema.virtual("fullName").get(function () {
  return `${this.name}`;
});

//Metodo estatico para buscar por email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

//Index para mejorar performance en busqueda
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);
export default User;
