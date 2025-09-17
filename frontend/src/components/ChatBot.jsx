import { useState, useEffect, useRef } from "react";
import { api } from "../api/api.js";
import Message from "./Message.jsx";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch chat history
  const fetchMessages = async () => {
    try {
      const res = await api.get("/chat");
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };

  // Fetch PDFs
  const fetchPdfs = async () => {
    try {
      const res = await api.get("/pdf/list");
      setPdfs(res.data || []);
    } catch (err) {
      console.error("Error fetching PDFs:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchPdfs();

    const onPdfsUpdated = () => {
      fetchPdfs();
    };
    window.addEventListener("pdfs-updated", onPdfsUpdated);
    return () => window.removeEventListener("pdfs-updated", onPdfsUpdated);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...(prev || []), userMessage]);
    setInput("");

    try {
      console.log("Sending to backend:", {
        question: input,
        pdfId: selectedPdf?.cloudinaryPublicId || null,
      });

      const res = selectedPdf
        ? await api.post("/pdf/query", {
            question: input,
            pdfId: selectedPdf.cloudinaryPublicId,
          })
        : await api.post("/chat", { message: input });

      const botReply = {
        role: "bot",
        content: res.data.answer || res.data.response || "No response",
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Something went wrong. Please try again later.";
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: errorMsg },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[560px] border border-gray-100 rounded-3xl shadow-lg bg-gradient-to-b from-white to-gray-50">
      {/* PDF Selector */}
      {pdfs.length > 0 && (
        <div className="p-4 border-b border-gray-100 bg-white/70 backdrop-blur-sm rounded-t-3xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 font-medium">Contextual PDF</span>
              <span className="text-[10px] text-gray-500">(optional)</span>
            </div>
            {selectedPdf && (
              <button
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                onClick={() => setSelectedPdf(null)}
              >
                <span className="i-ph-x text-base"></span>
                Clear
              </button>
            )}
          </div>
          <select
            className="mt-2 w-full border border-gray-300 rounded-xl p-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none pr-8"
            value={selectedPdf?.cloudinaryPublicId || ""}
            onChange={(e) => {
              const chosen = pdfs.find(
                (p) => p.cloudinaryPublicId === e.target.value
              );
              setSelectedPdf(chosen || null);
            }}
          >
            <option value="">No PDF Context</option>
            {pdfs.map((pdf) => (
              <option
                key={pdf.cloudinaryPublicId}
                value={pdf.cloudinaryPublicId}
              >
                {pdf.originalName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-white to-gray-50 custom-scroll">
        {(messages || []).map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 border-t border-gray-100 p-4 bg-white/70 backdrop-blur-sm rounded-b-3xl">
        <textarea
          className="flex-1 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none h-14 max-h-36 text-gray-800 placeholder-gray-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
        />
        <button
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <span className="i-ph-paper-plane-tilt text-lg"></span>
              Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}
