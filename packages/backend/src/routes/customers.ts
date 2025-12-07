import { Router } from "express";
import {
    verifyOTP,
    registerCustomer
} from "../controllers/customerController";


const router = Router();

router.post("/registerCustomer", registerCustomer);
router.post("/otp/verify", verifyOTP);

export default router;