import { Router } from "express";
import {
  createNotificacao,
  getAllNotificacao,
  getNumberUserNotificacao,
  visualizarNotificacao,
} from "../../controllers/notificacao/notificacao.controller";

const router = Router();

router.post("/criar", createNotificacao);
router.get("/", getAllNotificacao);
router.post("/visualizar/:userId/:notificacaoId", visualizarNotificacao);
router.post("/numero-notificacao/:userId", getNumberUserNotificacao);

export default router;
