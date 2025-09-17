

import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String,unique: true,sparse:true },
  content: { type: String },
  uploadDate: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "bot"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
    pdfs: [pdfSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);