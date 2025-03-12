import { PrismaClient } from "@prisma/client";
import app from "./app";

const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;

const server = async () => {
  try {
    await prisma.$connect();
    console.log("Conectado ao banco de dados");

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
};

server();
