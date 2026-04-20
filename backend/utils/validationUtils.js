import validator from "validator";

// ✅ Validar nombre
export const validateName = (name) => {
  const reglas = [
    { test: (n) => !!n, mensaje: "Nombre es requerido" },
    {
      test: (n) => n.length >= 2,
      mensaje: "Nombre debe tener al menos 2 caracteres",
    },
    {
      test: (n) => n.length <= 50,
      mensaje: "Nombre no puede exceder 50 caracteres",
    },
    {
      test: (n) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(n),
      mensaje: "Nombre solo puede contener letras y espacios",
    },
  ];

  const error = reglas.find((regla) => !regla.test(name));
  return error ? error.mensaje : null;
};

// ✅ Validar email
export const validateEmail = (email) => {
  const reglas = [
    { test: (e) => !!e, mensaje: "El email es requerido" },
    {
      test: (e) => validator.isEmail(e),
      mensaje: "El email no tiene formato válido",
    },
  ];

  const error = reglas.find((regla) => !regla.test(email));
  return error ? error.mensaje : null;
};

// ✅ Validar contraseña
export const validatePassword = (password) => {
  const reglas = [
    { test: (p) => !!p, mensaje: "La contraseña es requerida" },
    {
      test: (p) => p.length >= 8,
      mensaje: "La contraseña debe tener más de 8 caracteres",
    },
    {
      test: (p) => /[A-Z]/.test(p),
      mensaje: "La contraseña debe tener al menos una mayúscula",
    },
    {
      test: (p) => /[0-9]/.test(p),
      mensaje: "La contraseña debe tener al menos un número",
    },
  ];

  const error = reglas.find((regla) => !regla.test(password));
  return error ? error.mensaje : null;
};

// ✅ Validar datos de registro
export const validateRegistrationData = (data) => {
  const reglas = {
    name: validateName,
    email: validateEmail,
    password: validatePassword,
  };

  const errors = Object.entries(reglas).reduce((acc, [campo, fn]) => {
    const error = fn(data[campo]);
    if (error) acc[campo] = error;
    return acc;
  }, {});

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ✅ Validar datos de login
export const validateLoginData = (data) => {
  const reglas = {
    email: validateEmail,
    password: (p) => (!!p ? null : "Contraseña es requerida"),
  };

  const errors = Object.entries(reglas).reduce((acc, [campo, fn]) => {
    const error = fn(data[campo]);
    if (error) acc[campo] = error;
    return acc;
  }, {});

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
