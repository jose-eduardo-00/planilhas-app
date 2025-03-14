import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userRoutes from "./routes/user/user.routes";
import authRoutes from "./routes/auth/auth.routes";
import planilhaRoutes from "./routes/planilha/planilha.routes";


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/planilha", planilhaRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("API rodando");
});

export default app;
