# Tutor de IA de Inglês — Setup

## 1. Pegue a chave gratuita do Gemini
- Acesse https://aistudio.google.com/apikey
- Crie uma API key (sem cartão de crédito)

## 2. Variáveis de ambiente (Vercel + `.env.local`)
```
GEMINI_API_KEY=sua_chave_aqui
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

## 3. Banco de dados
Rode o arquivo `supabase-schema.sql` no SQL Editor do Supabase.

## 4. Arquivos do projeto
- `route.ts` → mova para `app/api/tutor/route.ts`
- `TutorChat.tsx` → mova para `components/TutorChat.tsx`

## 5. Como usar o componente
```tsx
// em alguma page.tsx, ex: app/tutor/page.tsx
import TutorChat from "@/components/TutorChat";

export default function TutorPage() {
  const conversationId = "crie-ou-busque-uma-conversation-id-do-supabase";
  return <TutorChat conversationId={conversationId} />;
}
```
Você vai precisar criar uma `conversation` no Supabase antes (insert na tabela `conversations`) e passar o `id` gerado para o componente — isso é o que agrupa as mensagens de cada sessão de estudo.

## 6. Dependência
```
npm install @supabase/supabase-js
```

## Como funciona
- O aluno digita ou fala (botão 🎤, usando reconhecimento de voz nativo do navegador)
- A mensagem vai pro `/api/tutor`, que chama o Gemini com um prompt que instrui a IA a: conversar naturalmente + detectar erros + retornar correção estruturada em JSON
- Se houve erro, aparece um card mostrando o texto errado, a correção e uma explicação em português
- A resposta do tutor também é falada em voz alta (`speechSynthesis`, também nativo e grátis)
- Tudo fica salvo no Supabase para você depois montar um dashboard de progresso (ex: erros mais comuns)

## Limites do free tier do Gemini (modelo `gemini-2.5-flash`)
Generoso o suficiente para uso pessoal/MVP, mas se seu site crescer, vale monitorar no Google AI Studio e considerar ativar billing.
