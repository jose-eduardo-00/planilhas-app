import { Router } from "express";
import {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  resendPassword,
  updateData,
  updatePassword,
} from "../../controllers/user/user.controller";
import { uploadAvatar } from "../../helpers/img-uploader";

const router = Router();

router.post("/register", uploadAvatar.single("avatar"), createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/edit/:id", uploadAvatar.single("avatar"), updateUser);
router.put("/update-data/:id", updateData);
router.delete("/delete/:id", deleteUser);
router.post("/resend-password", resendPassword);
router.put("/update-password/:id", updatePassword);

export default router;
