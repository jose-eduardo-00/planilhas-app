import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

export const enviarEmail = async (
  to: string,
  subject: string,
  code: string,
  nome: string
) => {
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    !process.env.EMAIL_FROM
  ) {
    throw new Error(
      "EMAIL_USER, EMAIL_PASS ou EMAIL_FROM não definidos no .env"
    );
  }

  // Caminho do template
  const templatePath = path.resolve(
    __dirname,
    "../../template/code",
    "index.html"
  );

  // Lê o conteúdo do template
  const template = fs.readFileSync(templatePath, "utf-8");

  // Substituição de variáveis
  const htmlContent = template
    .replace(/{{nome}}/g, nome)
    .replace(/{{codigo_confirmacao}}/g, code);

  // Configura o transporte via Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // precisa ser uma senha de app!
    },
  });

  // Define o e-mail
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: htmlContent,
  };

  // Envia
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail enviado com sucesso:", info.response);
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw new Error("Falha ao enviar o e-mail.");
  }
};
