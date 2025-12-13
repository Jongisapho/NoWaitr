import { Router } from "express";
import {
    registerBusiness
} from "../controllers/businessController";


const router = Router();

router.post("/registerBusiness", registerBusiness);

export default router;