import nodemailer from "nodemailer";

export const sendResetEmail = async (
  to: string,
  code: string
): Promise<void> => {
  // Transporter configurado com Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail", // ← mais simples do que usar host e port
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // precisa ser uma SENHA DE APP
    },
  });

  // Validação básica
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER ou EMAIL_PASS não definidos no .env");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Recuperação de Senha",
    html: `
      <h1>Recuperação de Senha</h1>
      <p>Olá,</p>
      <p>Seu código de recuperação chegou! Use o código abaixo para redefinir sua senha:</p>
      <h2 style="color: #2c3e50;">${code}</h2>
      <p>Este código expira em 15 minutos.</p>
      <p>Se você não solicitou essa ação, ignore este e-mail.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Código de recuperação enviado para: ${to}`);
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw new Error("Erro ao enviar o e-mail de recuperação.");
  }
};
