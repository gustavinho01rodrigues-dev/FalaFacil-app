"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col justify-center px-6 py-16 max-w-3xl mx-auto text-center">
        <span className="uppercase tracking-[0.2em] text-xs text-moss font-medium mb-4">
          fala inglês · fala espanhol
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-semibold leading-tight mb-6">
          Ouça a frase.<br />Repita em voz alta.<br />
          <span className="text-clay">Ouça sua própria voz.</span>
        </h1>
        <p className="text-lg text-ink/70 mb-10 max-w-xl mx-auto">
          Um tutor de pronúncia com frases reais, faladas de verdade pelo navegador,
          para você treinar o ouvido e a fala em inglês e espanhol.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-moss text-paper px-8 py-3 rounded-full font-medium hover:bg-ink transition-colors"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="border border-ink/20 px-8 py-3 rounded-full font-medium hover:border-ink transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      <div className="border-t border-ink/10 py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-6 justify-center text-sm text-ink/50">
          <span>🔊 Voz falada de verdade</span>
          <span>🎙️ Grave e compare</span>
          <span>📊 Nota automática de pronúncia</span>
        </div>
      </div>
    </main>
  );
}
