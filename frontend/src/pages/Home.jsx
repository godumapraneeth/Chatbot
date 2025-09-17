import ChatBot from "../components/ChatBot";
import PDFUploader from "../components/PDFUploader";
import { AuthProvider,useAuth } from "../context/AuthContext";

export default function Home() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex flex-col items-center p-6">
      <div className="w-full max-w-6xl animate-fade-in-up">
        <header className="flex justify-between items-center mb-8 py-4 px-6 bg-white/80 backdrop-blur-lg rounded-full shadow-lg ring-1 ring-black/5">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight leading-tight">
              My AI Chat
            </h1>
            <p className="mt-1 text-sm text-gray-600 hidden md:block">Chat with AI and query your PDFs contextually.</p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-full shadow-md hover:shadow-lg hover:from-red-600 hover:to-pink-600 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            <span className="i-ph-sign-out-bold"> </span>
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Chat Section */}
          <div className="md:col-span-2 bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl ring-1 ring-black/5 p-6 transform hover:scale-[1.005] transition duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Chat with AI</h2>
              <span className="text-[11px] px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-medium animate-pulse">Realtime</span>
            </div>
            <ChatBot />
          </div>

          {/* PDF Upload Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl ring-1 ring-black/5 p-6 transform hover:scale-[1.005] transition duration-300">
            <PDFUploader />
          </div>
        </div>
      </div>
    </div>
  );
}
