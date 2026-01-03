import { Router } from "express";
import { inviteUser, verifyToken, registerStaff } from "../controllers/userAuthController";

const router = Router();

router.post("/invite", inviteUser);
router.post("/validate-token", verifyToken);
router.post("/register", registerStaff);

export default router;