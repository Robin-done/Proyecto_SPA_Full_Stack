import validator from "validator";

export const validateContactData = (data) => {
  const errors = {};
  //Validar nombre
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "El nombre es requerido";
  } else if (data.name.length < 2 || data.name.length > 100) {
    errors.name = "El nombre debe tener entre 2 y 100 caracteres";
  }

  //Validar email
  if (!data.email || data.email.trim().length === 0) {
    errors.email = "El email es requerido";
  } else if (!validator.isEmail(data.email)) {
    errors.email = "Por favor ingresa un email válido";
  }

  //Validar asunto
  if (!data.subject || data.subject.trim().length === 0) {
    errors.subject = "El asunto es requerido";
  } else if (data.subject.length < 5 || data.subject.length > 100) {
    errors.subject = "El asunto debe tener entre 5 y 100 caracteres";
  }

  //Validar mensaje
  if (!data.message || data.message.trim().length === 0) {
    errors.message = "El mensaje es requerido";
  } else if (data.message.length < 10 || data.message.length > 2000) {
    errors.message = "El mensaje debe tener entre 10 y 2000 caracteres";
  }
  //Validar teléfono (opcional)
  if (data.phone && data.phone.trim().length > 0) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(data.phone)) {
      errors.phone = "Por favor ingresa un número de teléfono válido";
    }
  }

  //Validar categoría
  const validCategories = [
    "general",
    "support",
    "sales",
    "technical",
    "complaint",
    "suggestion",
  ];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.category = "Por favor selecciona una categoría válida";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Sanitizar datos del formulario
export const sanitizeContactData = (data) => {
  return {
    name: validator.trim(validator.escape(data.name || "")),
    email: validator.normalizeEmail(validator.trim(data.email || "")),
    subject: validator.trim(validator.escape(data.subject || "")),
    message: validator.trim(validator.escape(data.message || "")),
    phone: data.phone
      ? validator.trim(validator.escape(data.phone || ""))
      : undefined,
    category: validator.trim(data.category || "general"),
  };
};

//Formatear respuesta del mensaje
export const formatContactResponse = (contactMessage) => {
  return {
    id: contactMessage._id,
    name: contactMessage.name,
    email: contactMessage.email,
    subject: contactMessage.subject,
    message: contactMessage.message,
    phone: contactMessage.phone,
    status: contactMessage.status,
    priority: contactMessage.priority,
    category: contactMessage.category,
    createdAt: contactMessage.createdAt,
    ageInHours: contactMessage.ageInHours,
  };
};

// Configurar email de confirmación para el usuario
export const generateConfirmationEmail = (contactData) => {
  return {
    subject: "Confirmación de recepción de tu mensaje",
    html: `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />

                <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #007bff; color: white; padding: 20px; text-align: center; }

                .content { background: #f9f9f9; padding: 20px; }
                .footer { background: #333; color: white; padding: 10px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                <div class="header">
                    <h1>Gracias por contactarnos</h1>
                </div>
                <div class="content">
                    <p>Hola <strong>${contactData.name}</strong>,</p>
                    <p>
                        Hemos recibido tu mensaje y te responderemos dentro de las proximas 24 horas.
                    </p>
                    <p><strong>Asunto :</strong> ${contactData.subject}</p>
                    <p><strong>Mensaje :</strong></p>
                    <p>${contactData.message}</p>
                    <p>Número de referencia: <strong>${contactData._id}</strong></p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 RDG Webmaster. Todos los derechos reservados.</p>
                </div>
                </div>
            </body>
            </html>`,
  };
};

// Configurar email de notificación para admin
export const generateAdminNotificationEmail = (contactData) => {
  return {
    subject: `📩 Nuevo mensaje de contacto: ${contactData.subject}`,
    html: `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />

                <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: #28a745;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                .content {
                    background: #f9f9f9;
                    padding: 20px;
                }
                .info-item {
                    margin-bottom: 10px;
                }
                .label {
                    font-weight: bold;
                    color: #555;
                }
                </style>
            </head>

            <body>
                <div class="container">
                <div class="header">
                    <h1>Nuevo Mensaje de Contacto</h1>
                </div>
                <div class="content">
                    <div class="info-item">
                    <span class="label">Nombre :</span> ${contactData.name}
                    </div>

                    <div class="info-item">
                    <span class="label">Email :</span> ${contactData.email}
                    </div>

                    <div class="info-item">
                    <span class="label">Telefono :</span> ${contactData.phone || "No proporcionado"}
                    </div>

                    <div class="info-item">
                    <span class="label">Categoria :</span> ${contactData.category}
                    </div>

                    <div class="info-item">
                    <span class="label">Asunto :</span> ${contactData.subject}
                    </div>

                    <div class="info-item"><span class="label">Mensaje :</span></div>
                    <p>${contactData.message}</p>
                    <div class="info-item">
                    <span class="label">ID :</span> ${contactData._id}
                    </div>

                    <div class="info-item">
                    <span class="label">Fecha :</span> ${new Date(contactData.createdAt).toLocaleString()}
                    </div>
                </div>
                </div>
            </body>
        </html>`,
  };
};
