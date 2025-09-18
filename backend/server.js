// STEP 1: Load environment variables IMMEDIATELY and EXPLICITLY.
// server.js

// STEP 1: Load environment variables FIRST using the dedicated loader.
import "./config-loader.js"; // <-- ADD THIS LINE. IT MUST BE FIRST.

// STEP 2: Now, import all other modules.
import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";

// ... (the rest of your server.js file remains the same)
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin:["http://localhost:5173",process.env.FRONTEND_URL],
  credentials:true,
}));
app.use(morgan("dev"));

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url, req.headers.origin);
  next();
});


// API Routes
app.use("/api/auth", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/pdf",pdfRoutes);

// Root route for testing
app.get("/", (req, res) => {
    res.send("MERN AI Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

