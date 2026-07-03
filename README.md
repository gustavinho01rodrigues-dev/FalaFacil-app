# Fala Aí — pratique pronúncia de inglês e espanhol

App para praticar pronúncia: o tutor fala a frase em voz alta (voz nativa do
navegador), você grava sua própria pronúncia, ouve a comparação e recebe uma
nota automática de acerto.

## Como funciona a "voz falada de verdade"

Usa a **Web Speech API** do próprio navegador (`speechSynthesis`), que é
grátis e não precisa de nenhuma chave de API. A qualidade da voz depende do
navegador/sistema operacional (Chrome no Windows/Android costuma ter vozes
bem naturais em inglês e espanhol). Não é a mesma tecnologia dos apps tipo
Duolingo/ELSA (que usam TTS pago de altíssima qualidade), mas é uma alternativa
gratuita e funcional para validar a ideia.

A nota de pronúncia usa **SpeechRecognition** (reconhecimento de fala do
navegador) para transcrever o que você falou e comparar com o texto esperado.
Funciona bem no **Chrome e Edge**. No Safari e Firefox, o reconhecimento pode
não funcionar — nesse caso o app ainda permite gravar e ouvir sua voz, só não
calcula a nota automática.

---

## Passo 1 — Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta/projeto novo.
2. Vá em **SQL Editor** → cole todo o conteúdo do arquivo
   `supabase/schema.sql` deste projeto → clique em **Run**.
   Isso cria as tabelas `frases` e `progresso_usuario`, ativa a segurança
   (RLS) e já insere as 50 frases de teste.
3. Vá em **Project Settings → API**. Copie:
   - `Project URL`
   - `anon public key`
4. (Opcional, recomendado para testes) Em **Authentication → Providers →
   Email**, desative "Confirm email" para não precisar confirmar e-mail a
   cada cadastro de teste.

## Passo 2 — Configurar o projeto localmente

```bash
# dentro da pasta do projeto
cp .env.local.example .env.local
```

Edite `.env.local` e cole a URL e a chave anon copiadas do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

Instale as dependências e rode local:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`, crie uma conta e teste.

## Passo 3 — Subir para o GitHub

```bash
git init
git add .
git commit -m "primeira versão do app"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

⚠️ O arquivo `.env.local` **não** vai junto (está no `.gitignore`) — isso é
proposital, suas chaves não devem ir pro GitHub.

## Passo 4 — Publicar na Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New Project** → importe o
   repositório do GitHub que você acabou de criar.
2. Em **Environment Variables**, adicione as duas mesmas variáveis do
   `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Clique em **Deploy**. Pronto — a cada `git push` na branch `main`, a
   Vercel publica automaticamente a nova versão.

---

## Estrutura do projeto

```
app/
  page.js            → landing page
  login/page.js       → tela de login
  signup/page.js       → tela de cadastro
  dashboard/page.js    → lista de frases (protegida por login)
components/
  PhraseCard.jsx        → fala do tutor, gravação, nota de pronúncia
  Navbar.jsx
lib/
  supabaseClient.js     → conexão com Supabase
  useAuth.js             → hook de sessão do usuário
  similarity.js           → cálculo da nota de pronúncia
supabase/
  schema.sql               → tabelas + 50 frases de teste (25 EN + 25 ES)
```

## Próximos passos sugeridos

- Trocar a voz do navegador por uma API de TTS paga (ElevenLabs, Google
  Cloud TTS ou Azure) quando quiser qualidade de voz mais natural.
- Adicionar mais frases/categorias na tabela `frases` via Supabase Table
  Editor (não precisa mexer em código).
- Guardar o áudio gravado no Supabase Storage, se quiser ouvir tentativas
  antigas.
