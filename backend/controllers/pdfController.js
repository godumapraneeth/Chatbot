// controllers/pdfController.js
import Chat from "../models/Chat.js";
import cloudinary from "../config/cloudinary.js";
import pdfParse from "pdf-parse/lib/pdf-parse.js";  // ✅ direct import


export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Upload PDF to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "pdf-uploads" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // 2. Extract text with pdf-parse (from buffer, not fs!)
    const data = await pdfParse(req.file.buffer);
    const extractedText = data.text.trim();

    // 3. Save in MongoDB
    let chat = await Chat.findOne({ user: req.user._id });
    if (!chat) {
      chat = new Chat({ user: req.user._id, messages: [], pdfs: [] });
    }

    chat.pdfs.push({
      originalName: req.file.originalname,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      content: extractedText,
    });

    chat.messages.push({
      role: "bot",
      content: `📄 PDF "${req.file.originalname}" uploaded successfully.`,
    });

    await chat.save();

    res.json({
      message: "✅ PDF uploaded and processed successfully",
      pdf: chat.pdfs.at(-1),
    });
  } catch (err) {
    console.error("PDF upload error:", err);
    res.status(500).json({
      message: "Failed to process PDF",
      error: err.message,
    });
  }
};
