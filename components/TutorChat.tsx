// components/TutorChat.tsx
// Coloque em: components/TutorChat.tsx
// Requer: npm install @supabase/supabase-js (se ainda não tiver)

"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Message = {
  role: "user" | "tutor";
  content: string;
  correction?: {
    original: string;
    corrected: string;
    explanation: string;
    errorType: string;
  };
};

export default function TutorChat({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Configura o reconhecimento de voz (Web Speech API - grátis, nativo do navegador)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) {
      alert("Seu navegador não suporta reconhecimento de voz. Tente no Chrome.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }

  function speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      const tutorMessage: Message = {
        role: "tutor",
        content: data.reply,
        correction: data.had_error
          ? {
              original: data.original_text,
              corrected: data.corrected_text,
              explanation: data.explanation_pt,
              errorType: data.error_type,
            }
          : undefined,
      };

      setMessages((prev) => [...prev, tutorMessage]);
      speak(data.reply);

      // Persiste no Supabase
      await supabase.from("messages").insert([
        { conversation_id: conversationId, role: "user", content: userMessage.content },
        {
          conversation_id: conversationId,
          role: "tutor",
          content: data.reply,
          original_text: data.original_text ?? null,
          corrected_text: data.corrected_text ?? null,
          explanation: data.explanation_pt ?? null,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "tutor", content: "Ops, tive um problema para responder. Tenta de novo?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border"
              }`}
            >
              <p>{msg.content}</p>
              {msg.correction && (
                <div className="mt-2 text-sm bg-amber-50 border border-amber-200 rounded-lg p-2 text-gray-800">
                  <p>
                    <span className="line-through text-red-500">{msg.correction.original}</span>
                    {" → "}
                    <span className="text-green-600 font-medium">{msg.correction.corrected}</span>
                  </p>
                  <p className="mt-1 text-gray-600">{msg.correction.explanation}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <p className="text-gray-400 text-sm">Tutor está digitando...</p>}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 p-3 border-t bg-white">
        <button
          onClick={toggleListening}
          className={`rounded-full w-10 h-10 flex items-center justify-center shrink-0 ${
            isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100"
          }`}
          title="Falar"
        >
          🎤
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Escreva ou fale em inglês..."
          className="flex-1 border rounded-full px-4 py-2 outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white rounded-full px-4 py-2 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
