import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userRoutes from "./routes/user/user.routes";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/users", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("API rodando");
});

export default app;
