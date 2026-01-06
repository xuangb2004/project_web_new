import express from "express";
import { chatWithAI } from "../controllers/ai.js";

const router = express.Router();

router.post("/", chatWithAI);

export default router;
