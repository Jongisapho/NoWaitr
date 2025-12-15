import { Router } from "express";
import { registerCustomer, verifyOTP } from "../controllers/customerController";

const router = Router();

router.post("/register", registerCustomer);
router.post("/verify-otp", verifyOTP);

export default router;