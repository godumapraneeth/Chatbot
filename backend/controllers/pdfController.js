// pdfController.js
import Chat from "../models/Chat.js";
import cloudinary from "../config/cloudinary.js";
import pdfParse from "pdf-parse";

export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload file buffer to Cloudinary with OCR enabled
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "pdf-uploads",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Try extracting text using pdf-parse
    let extractedText = "";
    try {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text.trim();
    } catch (err) {
      console.warn("pdf-parse failed:", err.message);
    }

    // If pdf-parse failed or returned nothing, fallback to Cloudinary OCR
    if (!extractedText) {
      extractedText =
        uploadResult.info?.ocr?.adv_ocr?.data?.[0]?.fullTextAnnotation?.text ||
        "";
      if (!extractedText) {
        console.warn("⚠️ No text extracted from PDF (both pdf-parse and OCR failed)");
      }
    }

    // Save to DB
    let chat = await Chat.findOne({ user: req.user._id });
    if (!chat) {
      chat = new Chat({ user: req.user._id, messages: [], pdfs: [] });
    }

    chat.pdfs.push({
      originalName: req.file.originalname,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id.replace(/\.pdf$/, ""),
      content: extractedText,
      uploadDate: new Date(),
    });

    chat.messages.push({
      role: "bot",
      content: `📄 PDF "${req.file.originalname}" uploaded successfully.`,
    });

    await chat.save();

    const newPdf = chat.pdfs[chat.pdfs.length - 1];
    res.json({
      message: "✅ PDF uploaded and processed successfully",
      filename: req.file.originalname,
      pdf: newPdf,
      textPreview: extractedText.substring(0, 500) + "...",
    });
  } catch (err) {
    console.error("Cloudinary PDF upload error", err);
    res.status(500).json({
      message: "Failed to process PDF",
      error: err.message,
    });
  }
};
