import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTPHOST,
  port: process.env.SMTPPORT,
  secure: process.env.SMTPPORT == 465, // true si usas 465
  auth: {
    user: process.env.SMTPUSUARIO,
    pass: process.env.SMTPCLAVE,
  },
});

export default transporter;
