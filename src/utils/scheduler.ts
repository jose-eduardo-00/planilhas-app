import cron from "node-cron";
import { deleteOldUnverifiedUsers } from "./deleteUnverifiedUsers";

// Executa todo dia às 15:00 da tarde no fuso de São Paulo
cron.schedule(
  "0 15 * * *",
  async () => {
    console.log("Executando limpeza de usuários não verificados...");
    await deleteOldUnverifiedUsers();
  },
  {
    timezone: "America/Sao_Paulo",
  }
);
