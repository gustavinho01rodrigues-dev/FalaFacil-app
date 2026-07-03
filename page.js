"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import PhraseCard from "@/components/PhraseCard";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [idioma, setIdioma] = useState("en");
  const [frases, setFrases] = useState([]);
  const [progressoPorFrase, setProgressoPorFrase] = useState({});
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const carregarDados = useCallback(async () => {
    if (!user) return;
    setCarregandoDados(true);

    const { data: frasesData } = await supabase
      .from("frases")
      .select("*")
      .eq("idioma", idioma)
      .order("ordem", { ascending: true });

    const { data: progressoData } = await supabase
      .from("progresso_usuario")
      .select("*")
      .eq("user_id", user.id);

    const mapa = {};
    (progressoData ?? []).forEach((p) => {
      mapa[p.frase_id] = p;
    });

    setFrases(frasesData ?? []);
    setProgressoPorFrase(mapa);
    setCarregandoDados(false);
  }, [user, idioma]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-ink/40">Carregando...</p>
      </main>
    );
  }

  const concluidas = Object.values(progressoPorFrase).filter((p) => p.concluida).length;

  return (
    <main className="min-h-screen">
      <Navbar email={user.email} />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold">Suas frases</h1>
            <p className="text-ink/50 text-sm mt-1">
              {concluidas} de {frases.length} concluídas neste idioma
            </p>
          </div>

          <div className="flex gap-2 bg-white border border-ink/10 rounded-full p-1">
            <button
              onClick={() => setIdioma("en")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                idioma === "en" ? "bg-amber text-white" : "text-ink/50"
              }`}
            >
              Inglês
            </button>
            <button
              onClick={() => setIdioma("es")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                idioma === "es" ? "bg-clay text-white" : "text-ink/50"
              }`}
            >
              Espanhol
            </button>
          </div>
        </div>

        {carregandoDados ? (
          <p className="text-ink/40">Carregando frases...</p>
        ) : (
          <div className="grid gap-4">
            {frases.map((frase) => (
              <PhraseCard
                key={frase.id}
                frase={frase}
                userId={user.id}
                progresso={progressoPorFrase[frase.id]}
                onProgressoAtualizado={carregarDados}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
