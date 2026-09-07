// src/config/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // false para porta 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const enviarEmailNotificacao = async ({ destinatario, assunto, texto, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mailer] Credenciais SMTP ausentes no .env. Disparo ignorado com segurança.');
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"SISFEIRA" <${process.env.SMTP_USER}>`,
      to: destinatario,
      subject: assunto,
      text: texto,
      html: html
    });
    console.log(`[Mailer] E-mail entregue ao servidor SMTP para: ${destinatario}`);
    return true;
  } catch (err) {
    console.error('[Mailer Error]:', err.message);
    return false;
  }
};

module.exports = { enviarEmailNotificacao };