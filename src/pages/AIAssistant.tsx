import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Bot, User, Loader2, Sparkles, X } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useMedications } from "@/contexts/MedicationsContext";

// ✅ Paste your Cohere API key here
const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY;

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "I have a headache and fever 🤒",
  "Can I take ibuprofen after eating?",
  "What are common cold symptoms?",
  "I feel nauseous after my medication",
];

const AIAssistant = () => {
  const navigate = useNavigate();
  const { medications } = useMedications();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Hello! 👋 I'm your AI Health Assistant. I can help you with:\n\n• Analyzing your symptoms\n• Answering medication questions\n• General health guidance\n\nI'm aware of your ${medications.length} saved medication(s). How can I help you today?\n\n⚠️ I'm not a substitute for professional medical advice.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildSystemPrompt = () => {
    const medList =
      medications.length > 0
        ? medications
            .map((m) => `${m.name} ${m.dosage} (${m.frequency})`)
            .join(", ")
        : "none";

    return `You are a helpful, empathetic AI Health Assistant built into a medication management app called MediScan.
The user's current saved medications are: ${medList}.
Your role:
- Help users understand symptoms in simple, clear language
- Answer questions about medications, dosages, and interactions
- Provide general health guidance
- Always recommend consulting a real doctor for serious concerns
- Keep responses concise and mobile-friendly (short paragraphs)
- Use emojis sparingly to be friendly
- Never diagnose conditions. Always add a brief disclaimer for medical questions.
- Be aware of the user's saved medications when relevant to the question.`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build chat history for Cohere
      // Cohere uses "CHATBOT" for assistant and "USER" for user
      const chatHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role === "user" ? "USER" : "CHATBOT",
          message: m.text,
        }));

      const response = await fetch("https://api.cohere.com/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${COHERE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "command-r-plus-08-2024",
          message: text.trim(),
          chat_history: chatHistory,
          preamble: buildSystemPrompt(),
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error("Cohere API error:", errData);
        throw new Error(
          `Status ${response.status}: ${errData?.message || "Unknown error"}`,
        );
      }

      const data = await response.json();
      const responseText =
        data?.text || "I didn't get a response. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: responseText,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error calling Cohere:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "Sorry, something went wrong. Please check your connection and try again. 🔄",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: `Hello! 👋 I'm your AI Health Assistant. I can help you with:\n\n• Analyzing your symptoms\n• Answering medication questions\n• General health guidance\n\nI'm aware of your ${medications.length} saved medication(s). How can I help you today?\n\n⚠️ I'm not a substitute for professional medical advice.`,
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <MobileLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="gradient-primary px-5 pt-10 pb-4 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => navigate(-1)} className="tap-highlight p-1">
            <ArrowLeft size={22} className="text-primary-foreground" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Bot size={18} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-primary-foreground leading-none">
                AI Health Assistant
              </h1>
              <p className="text-[10px] text-primary-foreground/70 mt-0.5">
                Powered by Cohere
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-primary-foreground/70">
              Online
            </span>
          </div>
          <button
            onClick={clearChat}
            className="tap-highlight p-1.5 rounded-lg bg-primary-foreground/15"
          >
            <X size={16} className="text-primary-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-36">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                    msg.role === "assistant"
                      ? "gradient-primary"
                      : "bg-secondary"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot size={14} className="text-primary-foreground" />
                  ) : (
                    <User size={14} className="text-foreground" />
                  )}
                </div>

                <div
                  className={`max-w-[78%] flex flex-col gap-1 ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "gradient-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card text-foreground shadow-card rounded-tl-sm border border-border"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-muted-foreground px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2"
            >
              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-primary-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-sm bg-background border-t border-border px-4 pt-3 pb-3">
          {/* Quick prompts — only on first load */}
          {messages.length <= 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="flex-shrink-0 text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full tap-highlight whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-2xl px-4 py-2.5 shadow-card">
              <Sparkles size={14} className="text-primary flex-shrink-0" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask about symptoms or medications..."
                className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                input.trim() && !isLoading
                  ? "gradient-primary shadow-button"
                  : "bg-muted"
              }`}
            >
              {isLoading ? (
                <Loader2
                  size={16}
                  className="text-muted-foreground animate-spin"
                />
              ) : (
                <Send
                  size={16}
                  className={
                    input.trim()
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default AIAssistant;
