"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar({ email }) {
  const router = useRouter();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="border-b border-ink/10 px-6 py-4 flex items-center justify-between">
      <span className="font-display text-lg font-semibold">Fala Aí</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-ink/50 hidden sm:inline">{email}</span>
        <button
          onClick={sair}
          className="text-sm border border-ink/20 px-4 py-1.5 rounded-full hover:border-ink transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
