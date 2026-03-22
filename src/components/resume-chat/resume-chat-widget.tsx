"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Upload,
  FileText,
  Loader2,
  Bot,
  User,
  Sparkles,
  Trash2,
  ChevronDown,
} from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Mode = "govt" | "corporate";

const GOVT_PROMPTS = [
  "Create my study timetable for SSC CGL",
  "Which govt jobs suit a graduate?",
  "How to prepare for UPSC in 6 months?",
  "Best books for Railway Group D?",
  "Explain the syllabus for SSC CHSL",
  "What is age limit for IAS exam?",
];

const CORPORATE_PROMPTS = [
  "Which roles suit my profile?",
  "How ATS-friendly is my resume?",
  "What skills should I add?",
  "Write me a cover letter",
];

const GOVT_WELCOME = `नमस्ते! 👋 मैं आपका **सरकारी नौकरी AI Advisor** हूं।\n\nमैं आपकी मदद कर सकता हूं:\n\n- Study timetable बनाने में\n- Exam syllabus समझने में\n- Best books और strategy बताने में\n- किसी भी सरकारी परीक्षा की preparation में\n\nकोई भी सवाल पूछें!`;

const CORPORATE_WELCOME = `नमस्ते! 👋 मैं आपका **AI Career Advisor** हूं।\n\nअपना resume upload करें और मैं बताऊंगा:\n\n- आप कौन से roles target कर सकते हैं\n- Resume को ATS-friendly कैसे बनाएं\n- क्या improve करना है\n\nया कोई भी career question पूछें!`;

const ANALYZE_PROMPT = `Please analyze my resume and give me:\n1. Top roles I can target based on my experience and skills\n2. Is my resume ATS-friendly? What keywords are missing?\n3. Top 3 specific improvements I should make`;

function formatMessage(text: string) {
  return text.split("\n").map((line, i) => {
    const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <li key={i} className="ml-3 list-disc" dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-•]\s/, "") }} />
      );
    }
    if (line.match(/^\d+\.\s/)) {
      return <li key={i} className="ml-3 list-decimal" dangerouslySetInnerHTML={{ __html: formatted }} />;
    }
    if (!line.trim()) return <br key={i} />;
    return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

export function ResumeChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("govt");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hasNotif, setHasNotif] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Read job_mode from localStorage (same key as the toggle)
  useEffect(() => {
    function readMode() {
      const saved = localStorage.getItem("job_mode") as Mode | null;
      const newMode = saved === "corporate" ? "corporate" : "govt";
      setMode(newMode);
      setMessages([{ role: "assistant", content: newMode === "corporate" ? CORPORATE_WELCOME : GOVT_WELCOME }]);
      // Reset resume when switching to govt
      if (newMode === "govt") {
        setResumeText(null);
        setResumeName(null);
      }
    }
    readMode();

    // Listen for storage changes (when toggle switches)
    function onStorage(e: StorageEvent) {
      if (e.key === "job_mode") readMode();
    }
    window.addEventListener("storage", onStorage);

    // Also poll every second (same-tab localStorage doesn't fire storage event)
    const interval = setInterval(() => {
      const saved = localStorage.getItem("job_mode") as Mode | null;
      const newMode = saved === "corporate" ? "corporate" : "govt";
      setMode((prev) => {
        if (prev !== newMode) {
          setMessages([{ role: "assistant", content: newMode === "corporate" ? CORPORATE_WELCOME : GOVT_WELCOME }]);
          if (newMode === "govt") {
            setResumeText(null);
            setResumeName(null);
          }
        }
        return newMode;
      });
    }, 1000);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setHasNotif(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  async function uploadPDF(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("pdf", file);
      const res = await fetch("/api/resume-chat", { method: "PUT", body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResumeText(data.text);
      setResumeName(file.name);
      // Only send ONE analyze prompt
      await sendMessage(ANALYZE_PROMPT, data.text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ ${msg}` }]);
    } finally {
      setUploading(false);
    }
  }

  async function sendMessage(text: string, overrideResume?: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/resume-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          resumeText: overrideResume ?? resumeText,
          mode,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([{ role: "assistant", content: mode === "corporate" ? CORPORATE_WELCOME : GOVT_WELCOME }]);
    setResumeText(null);
    setResumeName(null);
  }

  const quickPrompts = mode === "corporate" ? CORPORATE_PROMPTS : GOVT_PROMPTS;
  const showQuickPrompts = !loading && messages.length <= 1;

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        {!open && hasNotif && (
          <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce-slow whitespace-nowrap">
            {mode === "corporate" ? "AI Career Advisor ✨" : "AI Study Advisor ✨"}
          </div>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-200"
          aria-label="Open AI Chat"
        >
          {open ? <ChevronDown className="h-6 w-6 text-white" /> : <Bot className="h-6 w-6 text-white" />}
          {hasNotif && !open && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 w-[360px] max-w-[calc(100vw-20px)] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className={`flex items-center gap-3 px-4 py-3 shrink-0 ${mode === "corporate" ? "bg-gradient-to-r from-violet-600 to-blue-600" : "bg-gradient-to-r from-blue-700 to-blue-500"}`}>
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-white leading-tight">
                {mode === "corporate" ? "AI Career Advisor" : "AI Study Advisor"}
              </p>
              <p className="text-[10px] text-white/70 font-medium">
                {mode === "corporate"
                  ? resumeName ? `📄 ${resumeName}` : "Upload resume for analysis"
                  : "Sarkari Job Preparation"
                }
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat} className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Clear chat">
                <Trash2 className="h-3.5 w-3.5 text-white" />
              </button>
              <button onClick={() => setOpen(false)} className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === "user" ? "bg-violet-600" : mode === "corporate" ? "bg-gradient-to-br from-violet-500 to-blue-500" : "bg-gradient-to-br from-blue-700 to-blue-500"}`}>
                  {msg.role === "user" ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed space-y-1 ${msg.role === "user" ? "bg-violet-600 text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"}`}>
                  {msg.role === "assistant"
                    ? <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                    : <p>{msg.content}</p>
                  }
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {(loading || uploading) && (
              <div className="flex gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${mode === "corporate" ? "bg-gradient-to-br from-violet-500 to-blue-500" : "bg-gradient-to-br from-blue-700 to-blue-500"}`}>
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <div className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {showQuickPrompts && (
            <div className="px-3 py-2 flex gap-1.5 flex-wrap border-t border-slate-100 bg-white shrink-0">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${mode === "corporate" ? "text-violet-700 bg-violet-50 border-violet-200 hover:bg-violet-100" : "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Resume upload — corporate mode only */}
          {mode === "corporate" && (
            <div className="px-3 py-2 border-t border-slate-100 bg-white shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadPDF(f);
                  e.target.value = "";
                }}
              />
              {!resumeText ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || loading}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-violet-700 bg-violet-50 border border-dashed border-violet-300 rounded-xl py-2 hover:bg-violet-100 transition-colors disabled:opacity-50"
                >
                  {uploading
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading resume...</>
                    : <><Upload className="h-3.5 w-3.5" /> Upload Resume PDF</>
                  }
                </button>
              ) : (
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="truncate flex-1">{resumeName}</span>
                  <button
                    onClick={() => { setResumeText(null); setResumeName(null); }}
                    className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-1 bg-white shrink-0">
            <div className="flex gap-2 items-end bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={mode === "corporate" ? "Ask about your career..." : "Ask about exam prep..."}
                rows={1}
                className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 resize-none outline-none font-medium leading-relaxed max-h-24"
                style={{ minHeight: "20px" }}
                disabled={loading || uploading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading || uploading}
                className="h-7 w-7 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <p className="text-[9px] text-slate-400 text-center mt-1 font-medium">
              Enter to send • Powered by Llama 3.2
            </p>
          </div>
        </div>
      )}
    </>
  );
}
