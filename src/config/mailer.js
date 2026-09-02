// src/config/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const enviarEmailNotificacao = async ({ destinatario, assunto, texto, html }) => {
  if (!process.env.SMTP_HOST) {
    console.warn('[Mailer] SMTP não configurado. Disparo ignorado com segurança.');
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || '"SISFEIRA" <no-reply@sisfeira.local>',
      to: destinatario,
      subject: assunto,
      text: texto,
      html: html,
    });
    return true;
  } catch (err) {
    console.error('[Mailer Error]:', err.message);
    return false;
  }
};

module.exports = { enviarEmailNotificacao };