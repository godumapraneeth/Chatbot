export default function Message({ role, content }) {
  return (
    <div className={`my-2 flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <p
        className={`px-4 py-2 rounded-2xl max-w-[75%] shadow-md text-sm md:text-base ${
          role === "user"
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
            : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
        }`}
      >
        {content}
      </p>
    </div>
  );
}
