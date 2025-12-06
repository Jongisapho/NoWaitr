import { Router } from "express";
import { registerOrFindCustomer } from "../controllers/customerController";

const router = Router();

router.post("/register-or-find", registerOrFindCustomer);

export default router;