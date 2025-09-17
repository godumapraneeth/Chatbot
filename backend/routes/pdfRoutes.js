import express from "express";
import multer from "multer";
import { uploadPDF } from "../controllers/pdfController.js";
import { queryPDF,listPDFs,deletePDF } from "../controllers/pdfQueryController.js";
import {protect} from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";
const router=express.Router();


router.post("/upload",protect,upload.single("pdf"),uploadPDF);
router.get("/list",protect,listPDFs);
router.delete("/delete/:publicId",protect,deletePDF)
router.post("/query",protect,queryPDF);


export default router;