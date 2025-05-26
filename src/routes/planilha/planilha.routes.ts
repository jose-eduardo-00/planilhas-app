import { Router } from "express";
import {
  createPlanilha,
  getPlanilhasByUser,
  updatePlanilha,
  deletePlanilha,
  addLinhaToPlanilha,
  getPlanilhaById,
  getPlanilhas,
  updateLinhaPlanilha,
  deleteLinhaPlanilha,
} from "../../controllers/planilha/planilha.controller";

const router = Router();

router.post("/register", createPlanilha);
router.post("/:planilhaId/linhas", addLinhaToPlanilha);
router.get("/:userId", getPlanilhasByUser);
router.get("/byId/:id", getPlanilhaById);
router.get("/", getPlanilhas);
router.put("/edit/:id", updatePlanilha);
router.put("/edit-linha/:id", updateLinhaPlanilha);
router.delete("/delete/:id", deletePlanilha);
router.delete("/delete-linha/:id", deleteLinhaPlanilha);

export default router;
