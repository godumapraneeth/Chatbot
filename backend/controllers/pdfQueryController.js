// pdfQueryController.js

import Chat from "../models/Chat.js";
import { geminiModel } from "../config/gemini.js";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";


export const queryPDF = async (req, res) => {
  try {
    const { question, pdfId } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const chat = await Chat.findOne({ user: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: "No chat found for this user" });
    }

    // Pick the right PDF
    let selectedPdf;
    if (pdfId) {
      selectedPdf = chat.pdfs.find(p => p.cloudinaryPublicId.includes(pdfId));
      if (!selectedPdf) {
        return res.status(404).json({ message: "PDF not found" });
      }
    }

    // Use selected PDF or all PDFs if none selected
    const pdfContext = selectedPdf
      ? selectedPdf.content
      : chat.pdfs.map(pdf => pdf.content).join("\n\n---\n\n");

    if (!pdfContext) {
      return res.status(404).json({ message: "No PDF content found" });
    }

    const prompt = `Based ONLY on the content below, answer the user's question.

    PDF CONTENT:
    ---
    ${pdfContext}
    ---

    USER QUESTION: "${question}"
    ANSWER:`;

    let result;
    try {
      result = await geminiModel.generateContent(prompt);
    } catch (error) {
      console.error("Gemini API (PDF Query) error:", error);
      const status = error?.status || error?.response?.status;
      const msg = error?.message || error?.response?.data?.message;
      return res.status(status && status >= 400 && status < 600 ? status : 503).json({
        message: msg || "The AI model is currently unavailable. Please try again later.",
      });
    }

    const response = result.response.text();

    chat.messages.push({ role: "user", content: question });
    chat.messages.push({ role: "bot", content: response });
    await chat.save();

    res.json({ answer: response });

    console.log("Looking for pdfId:", pdfId);
console.log("Available pdfs:", chat.pdfs.map(p => p.cloudinaryPublicId));

  } catch (err) {
    console.error("PDF Query error", err);
    res.status(500).json({ message: "Failed to process question", error: err.message });
  }
};


export const listPDFs = async (req, res) => {
  const chat = await Chat.findOne({ user: req.user._id });
  if (!chat || chat.pdfs.length === 0) {
    return res.json([]);
  }
  
  // Return useful info to the client
  res.json(
    chat.pdfs.map((pdf) => ({
      originalName: pdf.originalName,
      cloudinaryPublicId: pdf.cloudinaryPublicId,
      url: pdf.cloudinaryUrl,
      uploadDate: pdf.uploadDate,
    }))
  );
};
export const deletePDF = async (req, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return res.status(400).json({ message: "Missing publicId" });
    }

    // Delete from Cloudinary with robust fallbacks
    let destroyResult;
    const tryDestroy = async (resourceType) => {
      try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return result;
      } catch (e) {
        return { error: e };
      }
    };

    // Try auto → raw → image
    destroyResult = await tryDestroy("auto");
    if (destroyResult?.error || destroyResult?.result === "not found") {
      const rawAttempt = await tryDestroy("raw");
      destroyResult = rawAttempt?.error ? destroyResult : rawAttempt;
    }
    if (destroyResult?.error || destroyResult?.result === "not found") {
      const imageAttempt = await tryDestroy("image");
      destroyResult = imageAttempt?.error ? destroyResult : imageAttempt;
    }

    // If Cloudinary returned an operational error, surface it
    if (destroyResult?.error && !destroyResult?.result) {
      console.error("Cloudinary destroy error:", destroyResult.error);
      return res.status(500).json({ message: "Error deleting from Cloudinary", error: destroyResult.error.message || String(destroyResult.error) });
    }

    // Remove from Chat collection (match by user, not _id)
    const result = await Chat.updateOne(
      { user: req.user._id },
      { $pull: { pdfs: { cloudinaryPublicId: publicId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "PDF not found in database" });
    }

    res.json({ message: "PDF deleted successfully", cloudinary: destroyResult });
  } catch (err) {
    console.error("Delete PDF error:", err);
    res.status(500).json({ message: "Error deleting PDF", error: err.message });
  }
};
