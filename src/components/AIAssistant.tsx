"use client";

import { useState } from "react";
import { Bot, Send, X, RotateCcw, Loader2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

type Message = { role: "user" | "assistant"; content: string };

export default function AIAssistant() {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: lang === "ur"
        ? "میں آپ کی مدد کے لیے حاضر ہوں۔ آپ کیا پوچھنا چاہتے ہیں؟"
        : "I'm here to help. What would you like to ask?",
    },
  ]);

  const reset = () => setMessages([{
    role: "assistant",
    content: lang === "ur"
      ? "میں آپ کی مدد کے لیے حاضر ہوں۔ آپ کیا پوچھنا چاہتے ہیں؟"
      : "I'm here to help. What would you like to ask?",
  }]);

  const [streaming, setStreaming] = useState(false);

  async function sendMessage(text = input) {
    const message = text.trim();
    if (!message || busy) return;
    const next = [...messages, { role: "user" as const, content: message }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          language: lang,
          history: next.slice(-8),
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "AI unavailable");
      }

      // Stream the reply in live, token by token, so the user can watch it being written.
      setBusy(false);
      setStreaming(true);
      setMessages((current) => [...current, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((current) => {
          const updated = [...current];
          updated[updated.length - 1] = { role: "assistant", content: acc };
          return updated;
        });
      }

      if (!acc.trim()) throw new Error("Empty AI response");
    } catch {
      setMessages((current) => {
        const last = current[current.length - 1];
        const fallback = lang === "ur"
          ? "AI مدد عارضی طور پر دستیاب نہیں۔ براہ کرم Help / FAQ استعمال کریں۔"
          : "AI assistance is temporarily unavailable. Please use Help / FAQ or continue using JKADB normally.";
        // Replace an empty in-progress bubble instead of adding a duplicate one.
        if (last && last.role === "assistant" && !last.content) {
          return [...current.slice(0, -1), { role: "assistant", content: fallback }];
        }
        return [...current, { role: "assistant", content: fallback }];
      });
    } finally {
      setBusy(false);
      setStreaming(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-[70] flex w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:bg-slate-900">
          <div className="flex items-center gap-3 bg-green-800 px-4 py-3 text-white">
            <div className="rounded-xl bg-white/15 p-2"><Bot size={18} /></div>
            <div className="flex-1">
              <p className="font-bold">JKADB Assistant</p>
              <p className="text-xs text-white/70">{lang === "ur" ? "اردو یا English" : "English or اردو"}</p>
            </div>
            <button onClick={reset} title="Reset chat" className="rounded-lg p-2 hover:bg-white/10"><RotateCcw size={16}/></button>
            <button onClick={() => setOpen(false)} title="Close" className="rounded-lg p-2 hover:bg-white/10"><X size={18}/></button>
          </div>
          <div className="max-h-[50vh] min-h-64 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => {
              const isLastAssistant = m.role === "assistant" && i === messages.length - 1;
              const isTypingLive = isLastAssistant && streaming;
              return (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-6 ${m.role === "user" ? "bg-green-700 text-white" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"}`}>
                    {m.content}
                    {isTypingLive && <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-current align-middle" aria-hidden="true" />}
                  </div>
                </div>
              );
            })}
            {busy && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={15} className="animate-spin"/> Thinking…</div>}
          </div>
          <div className="border-t p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {[
                lang === "ur" ? "شکایت کیسے درج کروں؟" : "How do I submit a complaint?",
                lang === "ur" ? "شکایت کیسے ٹریک کروں؟" : "How can I track my complaint?",
              ].map((q) => <button key={q} onClick={() => sendMessage(q)} className="rounded-full bg-green-50 px-3 py-1.5 text-xs text-green-800 hover:bg-green-100">{q}</button>)}
            </div>
            <div className="flex gap-2">
              <input disabled={busy || streaming} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} placeholder={lang === "ur" ? "اپنا سوال لکھیں..." : "Type your question..."} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-green-600 disabled:opacity-60" maxLength={2000} />
              <button disabled={busy || streaming || !input.trim()} onClick={() => sendMessage()} className="rounded-xl bg-green-800 px-3 text-white disabled:opacity-50" aria-label="Send"><Send size={17}/></button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[69] flex items-center gap-2 rounded-full bg-green-800 px-4 py-3 text-sm font-bold text-white shadow-xl hover:bg-green-900"
        aria-label="Open JKADB AI Assistant"
      >
        <Bot size={18} /> <span className="hidden sm:inline">JKADB AI</span>
      </button>
    </>
  );
}
