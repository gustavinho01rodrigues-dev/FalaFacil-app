// app/api/tutor/route.ts
// Coloque este arquivo em: app/api/tutor/route.ts
// Variável de ambiente necessária: GEMINI_API_KEY (pegue grátis em https://aistudio.google.com/apikey)

import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é um tutor de inglês amigável e paciente, parecido com o tutor de IA do app Praktika.
Regras:
1. Converse naturalmente em inglês com o aluno sobre o tópico que ele trouxer.
2. Se o aluno cometer um erro de gramática, vocabulário ou construção de frase, NÃO ignore o erro.
3. Sempre responda em formato JSON válido, EXATAMENTE neste schema, sem nenhum texto fora do JSON:

{
  "reply": "sua resposta em inglês, dando continuidade natural à conversa",
  "had_error": true ou false,
  "original_text": "o texto exato que o aluno escreveu (só se had_error for true)",
  "corrected_text": "a versão corrigida (só se had_error for true)",
  "explanation_pt": "explicação curta e simples em português do porquê do erro (só se had_error for true)",
  "error_type": "categoria do erro, ex: verb tense, preposition, word order, vocabulary (só se had_error for true)"
}

Se não houver erro, retorne had_error: false e omita os demais campos de correção (ou deixe null).
Mantenha o tom encorajador — elogie o progresso antes de corrigir.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY não configurada" }, { status: 500 });
    }

    // Monta o histórico no formato do Gemini (contents)
    const contents = [
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role === "tutor" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json({ error: "Erro ao chamar a IA" }, { status: 502 });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: "Resposta vazia da IA" }, { status: 502 });
    }

    const parsed = JSON.parse(rawText);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Erro no /api/tutor:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
