import {geminiModel} from "../config/gemini.js";
import Chat from "../models/Chat.js";

export const getChatResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!geminiModel) {
      return res.status(503).json({ message: "AI model not initialized. Check GEMINI_API_KEY." });
    }

    let chat = await Chat.findOne({ user: req.user._id });
    if (!chat) {
      chat = new Chat({ user: req.user._id, messages: [] });
    }

    // Prepare history for Gemini API. It must start with 'user' and alternate roles.
    // We only use *previous* messages for history, not the current one.
    const historyForGemini = [];
    let expectedRoleInHistory = 'user';
    let foundFirstValidMessage = false;

    for (const msg of chat.messages) {
        const geminiRole = msg.role === "user" ? "user" : "model";

        if (!foundFirstValidMessage) {
            // Only start adding if the first message found is 'user'
            if (geminiRole === 'user') {
                historyForGemini.push({ role: geminiRole, parts: [{ text: msg.content }] });
                expectedRoleInHistory = 'model';
                foundFirstValidMessage = true;
            } else {
                // Skip leading 'model' messages
                console.warn("Skipping leading 'model' message in chat history for Gemini API.");
            }
        } else {
            // After the first valid message, ensure alternation
            if (geminiRole === expectedRoleInHistory) {
                historyForGemini.push({ role: geminiRole, parts: [{ text: msg.content }] });
                expectedRoleInHistory = (expectedRoleInHistory === 'user' ? 'model' : 'user');
            } else {
                // Log and break if history is malformed mid-stream
                console.warn(`Chat history non-alternating role detected: expected ${expectedRoleInHistory}, got ${geminiRole}. Truncating history.`);
                break;
            }
        }
    }

    const chatSession = geminiModel.startChat({ history: historyForGemini });

    let botResponse;
    try {
      // Send *current* user message to the session
      const result = await chatSession.sendMessage(message);
      botResponse = result.response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      const status = error?.status || error?.response?.status;
      const msg = error?.message || error?.response?.data?.message;
      return res.status(status && status >= 400 && status < 600 ? status : 503).json({
        message: msg || "The AI model is currently unavailable. Please try again later.",
      });
    }

    // Now, save *both* the current user message and the bot's response to the DB
    chat.messages.push({ role: "user", content: message });
    chat.messages.push({ role: "bot", content: botResponse });
    await chat.save();

    res.json({ response: botResponse });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ message: "Failed to generate response" });
  }
};


export const getChatHistory=async(req,res)=>{
    try{
        const chat=await Chat.findOne({user:req.user._id});
        res.json({messages:chat ? chat.messages : []});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Failed to fetch chat history"});
    }
};