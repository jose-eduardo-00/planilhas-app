import { Router } from 'express';
import {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  resendPassword,
} from '../../controllers/user/user.controller';

const router = Router();

router.post("/register", createUser);
router.get("/", getUsers); 
router.get("/:id", getUserById); 
router.put("/edit/:id", updateUser); 
router.delete("/delete/:id", deleteUser);
router.post("/resend-password", resendPassword); 

export default router;

