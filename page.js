"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    setSucesso(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-semibold mb-2">Criar conta</h1>
        <p className="text-ink/60 mb-8">Leva menos de um minuto.</p>

        {sucesso ? (
          <p className="text-moss bg-moss/10 rounded-lg p-4">
            Conta criada! Se a confirmação por e-mail estiver ativa no Supabase,
            confira sua caixa de entrada. Redirecionando para o login...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-ink/20 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Senha (mín. 6 caracteres)"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="border border-ink/20 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
            />

            {erro && <p className="text-clay text-sm">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="bg-moss text-paper rounded-full px-6 py-3 font-medium hover:bg-ink transition-colors disabled:opacity-50"
            >
              {carregando ? "Criando..." : "Criar conta"}
            </button>
          </form>
        )}

        <p className="text-sm text-ink/60 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-moss font-medium underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
