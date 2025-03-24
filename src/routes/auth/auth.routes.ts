import { Router } from "express";
import {
  loginUser,
  logoutUser,
  verifyCode,
} from "../../controllers/auth/auth.controller";

const router = Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify/:id", verifyCode);

export default router;
