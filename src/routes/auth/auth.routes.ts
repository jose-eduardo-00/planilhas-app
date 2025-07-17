import { Router } from "express";
import {
  checkToken,
  loginUser,
  logoutUser,
  sendEmail,
  verifyCode,
} from "../../controllers/auth/auth.controller";

const router = Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify/:id", verifyCode);
router.post("/check-token", checkToken);
router.post("/send-email", sendEmail);

export default router;
