import { Resend } from "resend";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

// Valida se a chave da API do Resend existe
if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY não definida no .env");
}

// Inicializa o cliente do Resend uma única vez
const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarEmail = async (
  to: string,
  subject: string,
  code: string,
  nome: string
) => {
  // O caminho e a leitura do template continuam iguais
  const templatePath = path.resolve(
    __dirname,
    "../../template/code",
    "index.html"
  );
  const template = fs.readFileSync(templatePath, "utf-8");
  const htmlContent = template
    .replace(/{{nome}}/g, nome)
    .replace(/{{codigo_confirmacao}}/g, code);

  try {
    // A mágica acontece aqui: uma única chamada para o Resend
    const { data, error } = await resend.emails.send({
      from: "Nome do seu App <voce@seudominioverificado.com>", // IMPORTANTE: Use o domínio que você verificou no Resend
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Erro ao enviar e-mail pelo Resend:", error);
      throw new Error("Falha ao enviar o e-mail.");
    }

    console.log("E-mail enviado com sucesso:", data);
  } catch (error) {
    console.error("Erro inesperado ao enviar e-mail:", error);
    throw new Error("Falha ao enviar o e-mail.");
  }
};
