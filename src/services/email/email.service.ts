import nodemailer from "nodemailer";

export const sendResetEmail = async (
  to: string,
  code: string
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Recuperação de Senha",
    html: `
      <h1>Recuperação de Senha</h1>
      <p>Olá,</p>
      <p>Seu código de recuperação chegou! Use o código abaixo para redefinir sua senha:</p>
      <h2>${code}</h2>
      <p>Este código expira em 15 minutos.</p>
      <p>Se você não solicitou essa ação, ignore este e-mail.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Código de recuperação enviado para: ${to}`);
};
