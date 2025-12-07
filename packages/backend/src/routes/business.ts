import { Router } from "express";
import {
    registerVenue
} from "../controllers/businessController";


const router = Router();

router.post("/registerVenue", registerVenue);

export default router;