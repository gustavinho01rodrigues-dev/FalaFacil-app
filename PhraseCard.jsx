"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { calcularNota } from "@/lib/similarity";

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function PhraseCard({ frase, userId, progresso, onProgressoAtualizado }) {
  const [falando, setFalando] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [nota, setNota] = useState(progresso?.melhor_nota ?? null);
  const [transcricao, setTranscricao] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);

  const idiomaTag = frase.idioma === "en" ? "en-US" : "es-ES";

  function ouvirTutor() {
    if (!("speechSynthesis" in window)) {
      alert("Seu navegador não suporta síntese de voz.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(frase.texto);
    utterance.lang = idiomaTag;
    utterance.rate = 0.9;
    setFalando(true);
    utterance.onend = () => setFalando(false);
    window.speechSynthesis.speak(utterance);
  }

  async function iniciarGravacao() {
    setAudioUrl(null);
    setTranscricao(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setGravando(true);

      // Reconhecimento de fala (se disponível: Chrome/Edge)
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = idiomaTag;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          const texto = event.results[0][0].transcript;
          setTranscricao(texto);
          const notaCalculada = calcularNota(frase.texto, texto);
          setNota((notaAnterior) =>
            notaAnterior === null ? notaCalculada : Math.max(notaAnterior, notaCalculada)
          );
          salvarProgresso(notaCalculada);
        };

        recognition.onerror = () => {
          // Falha silenciosa: usuário ainda pode ouvir a própria gravação
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  }

  function pararGravacao() {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setGravando(false);
  }

  async function salvarProgresso(notaCalculada) {
    if (!userId) return;
    setSalvando(true);

    const melhorNota = Math.max(notaCalculada, progresso?.melhor_nota ?? 0);

    await supabase.from("progresso_usuario").upsert(
      {
        user_id: userId,
        frase_id: frase.id,
        melhor_nota: melhorNota,
        tentativas: (progresso?.tentativas ?? 0) + 1,
        ultima_tentativa: new Date().toISOString(),
        concluida: melhorNota >= 70,
      },
      { onConflict: "user_id,frase_id" }
    );

    setSalvando(false);
    onProgressoAtualizado?.();
  }

  const corBadgeIdioma = frase.idioma === "en" ? "bg-amber/20 text-amber" : "bg-clay/20 text-clay";

  return (
    <div className="border border-ink/10 bg-white rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${corBadgeIdioma}`}>
          {frase.idioma === "en" ? "Inglês" : "Espanhol"}
        </span>
        {nota !== null && (
          <span className="text-sm font-semibold text-moss">{nota}% de acerto</span>
        )}
      </div>

      <div>
        <p className="font-display text-xl font-medium">{frase.texto}</p>
        <p className="text-ink/50 text-sm mt-1">{frase.traducao}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={ouvirTutor}
          disabled={falando}
          className="flex items-center gap-2 bg-moss text-paper px-4 py-2 rounded-full text-sm font-medium hover:bg-ink transition-colors disabled:opacity-60"
        >
          {falando ? "🔊 Falando..." : "🔊 Ouvir tutor"}
        </button>

        {!gravando ? (
          <button
            onClick={iniciarGravacao}
            className="flex items-center gap-2 border border-ink/20 px-4 py-2 rounded-full text-sm font-medium hover:border-ink transition-colors"
          >
            🎙️ Gravar minha voz
          </button>
        ) : (
          <button
            onClick={pararGravacao}
            className="flex items-center gap-2 bg-clay text-paper px-4 py-2 rounded-full text-sm font-medium animate-pulse"
          >
            ⏹️ Parar gravação
          </button>
        )}

        {audioUrl && (
          <audio controls src={audioUrl} className="h-9 self-center" />
        )}
      </div>

      {transcricao && (
        <p className="text-xs text-ink/50">
          Reconhecemos: <span className="italic">&quot;{transcricao}&quot;</span>
        </p>
      )}

      {!SpeechRecognitionAPI && (
        <p className="text-xs text-ink/40">
          A nota automática funciona melhor no Chrome ou Edge. Neste navegador, você ainda
          pode gravar e comparar de ouvido.
        </p>
      )}

      {salvando && <p className="text-xs text-ink/30">Salvando progresso...</p>}
    </div>
  );
}
