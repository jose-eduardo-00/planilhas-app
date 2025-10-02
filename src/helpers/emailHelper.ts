import { Resend } from "resend";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY não definida no .env");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarEmail = async (
  to: string,
  subject: string,
  code: string,
  nome: string
) => {
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
    const { data, error } = await resend.emails.send({
      from: "Planilhas <contato@updates.planilha.fun>",
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
