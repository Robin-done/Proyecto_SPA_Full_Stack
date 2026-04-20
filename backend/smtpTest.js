import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function testSMTP() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTPHOST,
      port: process.env.SMTPPORT,
      secure: true,
      auth: {
        user: process.env.SMTPUSUARIO,
        pass: process.env.SMTPCLAVE,
      },
    });

    /* // Verificar conexión
    await transporter.verify();
    console.log("✅ Conexión SMTP exitosa");

    // Enviar correo de prueba
    const info = await transporter.sendMail({
      from: `"Prueba SMTP" <${process.env.SMTPUSUARIO}>`,
      to: "rfernando@pzu.do",
      subject: "Prueba de SMTP",
      text: "Este es un correo de prueba desde Nodemailer usando tu hosting.",
    }); */

    console.log("📨 Correo enviado:", info.messageId);
  } catch (error) {
    console.error("❌ Error en SMTP:", error);
  }
}

testSMTP();
