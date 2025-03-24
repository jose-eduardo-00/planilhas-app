import { Resend } from "resend";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

const resend = new Resend("re_g2Gj88FC_KqiApHPW6PXWj2ZAJzuL48P9");

export const enviarEmail = async (
  to: string,
  subject: string,
  code: string,
  nome: string
) => {
  // Caminho do template HTML
  const templatePath = path.resolve(
    __dirname,
    "../../template/code",
    "index.html"
  );

  // Lendo o conteúdo do template
  const template = fs.readFileSync(templatePath, "utf-8");

  // Substituindo as variáveis do template com dados dinâmicos
  let htmlContent = template
    .replace("{{nome}}", nome) // Substitui o {{nome}} pelo nome real
    .replace("{{codigo_confirmacao}}", code);

  try {
    // Enviando o e-mail
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Planilhas <reply@planilhas.domain.com>",
      to: to,
      subject: subject,
      html: htmlContent,
    });

    console.log("E-mail enviado com sucesso:", response);
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
};
