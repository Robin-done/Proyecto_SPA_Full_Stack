import { ObjectId } from "mongodb";

//Validar ObjectId de mongoDB
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "ID no válido",
    });
  }
  next();
};

//Validar parámetros de query para Productos

export const validateProductQuery = (req, res, next) => {
  const { limit, page, minPrice, maxPrice, minRating } = req.query;

  const rules = [
    {
      field: "limit",
      value: limit,
      check: (v) => !isNaN(v) && parseInt(v) > 0,
      message: "El parámetro limit debe ser un número positivo",
    },
    {
      field: "page",
      value: page,
      check: (v) => !isNaN(v) && parseInt(v) > 0,
      message: "El parámetro page debe ser un número positivo",
    },
    {
      field: "minPrice",
      value: minPrice,
      check: (v) => !isNaN(v) && parseFloat(v) >= 0,
      message: "El parámetro minPrice debe ser un número positivo",
    },
    {
      field: "maxPrice",
      value: maxPrice,
      check: (v) => !isNaN(v) && parseFloat(v) >= 0,
      message: "El parámetro maxPrice debe ser un número positivo",
    },
    {
      field: "minRating",
      value: minRating,
      check: (v) => !isNaN(v) && parseFloat(v) >= 1 && parseFloat(v) <= 5,
      message: "El parámetro minRating debe ser entre 1 y 5",
    },
  ];

  for (const rule of rules) {
    if (rule.value !== undefined && !rule.check(rule.value)) {
      return res.status(400).json({ success: false, message: rule.message });
    }
  }

  next();
};
