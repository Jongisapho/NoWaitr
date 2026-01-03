import { Router } from "express";
import {registerBusiness, registerBranch} from "../controllers/businessController";


const router = Router();

router.post("/registerBusiness", registerBusiness);
router.post("/:id/registerBranch", registerBranch);

export default router;