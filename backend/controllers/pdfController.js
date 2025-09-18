import Chat from "../models/Chat.js";
import cloudinary from "../config/cloudinary.js";
// Import the new library
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Upload file to Cloudinary for storage
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

    // 2. Extract text using pdfjs-dist
    const pdf = await pdfjsLib.getDocument(req.file.buffer).promise;
    let extractedText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      extractedText += textContent.items.map((item) => item.str).join(" ");
    }
    extractedText = extractedText.trim();
    
    if (!extractedText) {
        console.warn("⚠️ pdfjs-dist could not extract text from this file.");
    }

    // 3. Save to the database
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

    const newPdf = chat.pdfs[chat.pdfs.length - 1];
    res.json({
      message: "✅ PDF uploaded and processed successfully",
      pdf: newPdf,
    });
  } catch (err) {
    console.error("PDF upload error", err);
    res.status(500).json({
      message: "Failed to process PDF",
      error: err.message,
    });
  }
};