import { Router } from "express";
import * as controller from "../controllers/queueController";

const router = Router();

router.post("/", controller.createQueue);
router.get("/:id", controller.getQueue);
router.post("/:id/join", controller.joinQueue);
router.post("/:id/next", controller.serveNext);
router.get("/:id/items", controller.listItems);

export default router;