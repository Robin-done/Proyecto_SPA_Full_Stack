import jwt from "jsonwebtoken";
import transporter from "../config/mailer.js";

//Enviar correo de verificación
export const sendVerificationEmail = async (user) => {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const url = `${process.env.FRONTEND_URL}/api/auth/activate/${token}`;

  await transporter.sendMail({
    from: `"Soporte" <${process.env.SMTPUSUARIO}>`,
    to: user.email,
    subject: "Confirmación de cuenta",
    html: `<p>Hola ${user.name}, confirma tu cuenta aquí: <a href="${url}" rel="noopener" style="display: inline; padding: 8px 15px; border:1px solid #4b1cf4; background:#4b1cf4; color: #ffffff; text-decoration:none; border-radius:10px;" target="_blank">Confirmar</a></p>`,
  });
};

//Recupercacion de Contraseña
export const sendPasswordResetEmail = async (user) => {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const url = `${process.env.FRONTEND_URL}/api/auth/reset-password/${token}`;

  await transporter.sendMail({
    from: `"Soporte" <${process.env.SMTPUSUARIO}>`,
    to: user.email,
    subject: "Recuperación de contraseña",
    html: `<p>Hola ${user.name}, restablece tu contraseña aquí: <a href="${url}" rel="noopener" style="display: inline; padding: 8px 15px; border:1px solid #4b1cf4; background:#4b1cf4; color: #ffffff; text-decoration:none; border-radius:10px;" target="_blank">Restablece</a></p>`,
  });
};

//Confirmación de cambio de correo
export const sendEmailChangeVerification = async (user, newEmail) => {
  const token = jwt.sign(
    { userId: user._id, newEmail },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  const url = `${process.env.FRONTEND_URL}/api/auth/verify-email-change/${token}`;

  await transporter.sendMail({
    from: `"Soporte" <${process.env.SMTPUSUARIO}>`,
    to: newEmail,
    subject: "Confirma tu nuevo correo",
    html: `<p>Hola ${user.name}, confirma tu nuevo correo aquí: <a href="${url}"  rel="noopener" style="display: inline; padding: 8px 15px; border:1px solid #4b1cf4; background:#4b1cf4; color: #ffffff; text-decoration:none; border-radius:10px;" target="_blank">Confirmar</a></p>`,
  });
};
