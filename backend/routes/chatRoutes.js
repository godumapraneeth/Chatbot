import express from "express";
import { getChatHistory, getChatResponse } from "../controllers/chatController.js";
import {protect} from "../middlewares/authMiddleware.js";

const router=express.Router()

router.post("/",protect,getChatResponse);
router.get("/",protect,getChatHistory);

export default router;


