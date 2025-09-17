import { useState, useEffect } from "react";
import { api } from "../api/api.js";
import { toast } from "react-toastify";

function PDFUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch list on mount
  const fetchPdfs = async () => {
    try {
      const res = await api.get("/pdf/list");
      setPdfs(res.data);
    } catch (err) {
      console.error(err);
      setPdfs([]);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      setLoading(true);
      await api.post("/pdf/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Upload successful!");
      setSelectedFile(null);
      fetchPdfs();
      // notify other components
      window.dispatchEvent(new CustomEvent("pdfs-updated"));
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("❌ Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (publicId) => {
    try {
      await api.delete(`/pdf/delete/${encodeURIComponent(publicId)}`);
      toast.success("🗑️ Deleted successfully!");
      setPdfs(pdfs.filter((pdf) => pdf.cloudinaryPublicId !== publicId));
      // notify other components
      window.dispatchEvent(new CustomEvent("pdfs-updated"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete PDF!");
    }
  };

  return (
    <div className="p-6 rounded-3xl border border-gray-100 shadow-xl bg-gradient-to-br from-white to-gray-50 w-full transform hover:scale-[1.005] transition duration-300">
      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <label className="text-lg font-bold text-gray-800">Upload a PDF</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="flex-1 border border-gray-300 rounded-xl p-3 text-sm text-gray-700 focus:ring-2 focus:ring-green-400 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition duration-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="whitespace-nowrap bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>

      {/* PDF List */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">Your PDFs</h3>
        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">{pdfs.length} total</span>
      </div>
      {pdfs.length === 0 ? (
        <div className="text-gray-500 text-sm bg-white border border-dashed border-gray-200 rounded-xl p-5 text-center flex flex-col items-center justify-center h-32">
          <span className="i-ph-file-pdf text-4xl mb-2 text-gray-300"></span>
          No PDFs uploaded yet.
        </div>
      ) : (
        <ul className="space-y-3 max-h-[340px] overflow-y-auto pr-2 custom-scroll">
          {pdfs.map((pdf) => (
            <li
              key={pdf.cloudinaryPublicId}
              className="group flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
            >
              <a
                href={pdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate text-blue-600 hover:text-blue-700 hover:underline font-medium"
                title={pdf.originalName}
              >
                <span className="i-ph-file-pdf text-blue-400 mr-2"></span>
                {pdf.originalName}
              </a>
              <button
                onClick={() => handleDelete(pdf.cloudinaryPublicId)}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 opacity-80 hover:opacity-100 transition"
              >
                <span className="i-ph-trash text-base"></span>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PDFUploader;
