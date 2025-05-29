import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userRoutes from "./routes/user/user.routes";
import authRoutes from "./routes/auth/auth.routes";
import planilhaRoutes from "./routes/planilha/planilha.routes";
import notificacaoRoutes from "./routes/notificacao/notificacao.routes";
import path from "path";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/planilha", planilhaRoutes);
app.use("/notificacao", notificacaoRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("API rodando");
});

export default app;
