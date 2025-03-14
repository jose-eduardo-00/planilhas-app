import { Router } from "express";
import {
  createPlanilha,
  getPlanilhasByUser,
  updatePlanilha,
  deletePlanilha,
} from "../../controllers/planilha/planilha.controller";

const router = Router();

router.post("/register", createPlanilha);
router.get("/:userId", getPlanilhasByUser);
router.put("/edit/:id", updatePlanilha);
router.delete("/delete/:id", deletePlanilha);

export default router;
