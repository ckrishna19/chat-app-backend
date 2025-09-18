import {
  newMessageController,
  getAllMessage,
} from "../controller/messageController.js";
import { Router } from "express";

const router = Router();

router.post("/new", newMessageController);

router.get("/all/:id", getAllMessage);

export default router;
