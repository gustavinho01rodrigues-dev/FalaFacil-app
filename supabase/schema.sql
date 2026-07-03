-- =========================================================
-- SCHEMA: App de aprendizado de idiomas (Inglês / Espanhol)
-- Rode este arquivo inteiro no SQL Editor do Supabase
-- =========================================================

-- Tabela de frases pré-estabelecidas
create table if not exists public.frases (
  id uuid primary key default gen_random_uuid(),
  idioma text not null check (idioma in ('en', 'es')),
  texto text not null,
  traducao text not null,
  categoria text not null default 'geral',
  nivel text not null default 'iniciante' check (nivel in ('iniciante', 'intermediario', 'avancado')),
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- Tabela de progresso do usuário por frase
create table if not exists public.progresso_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  frase_id uuid not null references public.frases(id) on delete cascade,
  melhor_nota numeric(5,2), -- 0 a 100
  tentativas int not null default 0,
  ultima_tentativa timestamptz,
  concluida boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, frase_id)
);

-- =========================================================
-- SEGURANÇA (Row Level Security)
-- =========================================================
alter table public.frases enable row level security;
alter table public.progresso_usuario enable row level security;

-- Qualquer pessoa logada pode ler as frases
create policy "Frases sao publicas para leitura"
  on public.frases for select
  using (true);

-- Usuário só vê e edita o PRÓPRIO progresso
create policy "Usuario ve seu proprio progresso"
  on public.progresso_usuario for select
  using (auth.uid() = user_id);

create policy "Usuario insere seu proprio progresso"
  on public.progresso_usuario for insert
  with check (auth.uid() = user_id);

create policy "Usuario atualiza seu proprio progresso"
  on public.progresso_usuario for update
  using (auth.uid() = user_id);

-- =========================================================
-- SEED: 50 frases (25 inglês + 25 espanhol)
-- =========================================================
insert into public.frases (idioma, texto, traducao, categoria, nivel, ordem) values
-- Inglês
('en', 'Hello, how are you?', 'Olá, como você está?', 'saudacoes', 'iniciante', 1),
('en', 'What is your name?', 'Qual é o seu nome?', 'saudacoes', 'iniciante', 2),
('en', 'Nice to meet you.', 'Prazer em conhecê-lo.', 'saudacoes', 'iniciante', 3),
('en', 'Where are you from?', 'De onde você é?', 'saudacoes', 'iniciante', 4),
('en', 'I am from Brazil.', 'Eu sou do Brasil.', 'saudacoes', 'iniciante', 5),
('en', 'How much does this cost?', 'Quanto isso custa?', 'compras', 'iniciante', 6),
('en', 'Can you help me, please?', 'Você pode me ajudar, por favor?', 'cotidiano', 'iniciante', 7),
('en', 'I would like a coffee.', 'Eu gostaria de um café.', 'restaurante', 'iniciante', 8),
('en', 'The check, please.', 'A conta, por favor.', 'restaurante', 'iniciante', 9),
('en', 'What time is it?', 'Que horas são?', 'cotidiano', 'iniciante', 10),
('en', 'I do not understand.', 'Eu não entendo.', 'cotidiano', 'iniciante', 11),
('en', 'Could you repeat that, please?', 'Você poderia repetir isso, por favor?', 'cotidiano', 'iniciante', 12),
('en', 'Where is the bathroom?', 'Onde fica o banheiro?', 'cotidiano', 'iniciante', 13),
('en', 'I am learning English.', 'Eu estou aprendendo inglês.', 'estudo', 'iniciante', 14),
('en', 'This is my first trip abroad.', 'Esta é minha primeira viagem ao exterior.', 'viagem', 'intermediario', 15),
('en', 'I need to book a room.', 'Eu preciso reservar um quarto.', 'viagem', 'intermediario', 16),
('en', 'What do you recommend?', 'O que você recomenda?', 'restaurante', 'intermediario', 17),
('en', 'I have a reservation.', 'Eu tenho uma reserva.', 'viagem', 'intermediario', 18),
('en', 'How do I get to the airport?', 'Como eu chego ao aeroporto?', 'viagem', 'intermediario', 19),
('en', 'I am allergic to peanuts.', 'Eu sou alérgico a amendoim.', 'saude', 'intermediario', 20),
('en', 'Could you speak more slowly?', 'Você poderia falar mais devagar?', 'cotidiano', 'intermediario', 21),
('en', 'I really enjoyed this movie.', 'Eu realmente gostei deste filme.', 'lazer', 'intermediario', 22),
('en', 'What are your plans for today?', 'Quais são seus planos para hoje?', 'cotidiano', 'intermediario', 23),
('en', 'I look forward to hearing from you.', 'Fico no aguardo do seu retorno.', 'trabalho', 'avancado', 24),
('en', 'It was a pleasure working with you.', 'Foi um prazer trabalhar com você.', 'trabalho', 'avancado', 25),
-- Espanhol
('es', 'Hola, ¿cómo estás?', 'Olá, como você está?', 'saudacoes', 'iniciante', 1),
('es', '¿Cómo te llamas?', 'Qual é o seu nome?', 'saudacoes', 'iniciante', 2),
('es', 'Mucho gusto.', 'Muito prazer.', 'saudacoes', 'iniciante', 3),
('es', '¿De dónde eres?', 'De onde você é?', 'saudacoes', 'iniciante', 4),
('es', 'Soy de Brasil.', 'Eu sou do Brasil.', 'saudacoes', 'iniciante', 5),
('es', '¿Cuánto cuesta esto?', 'Quanto isso custa?', 'compras', 'iniciante', 6),
('es', '¿Puedes ayudarme, por favor?', 'Você pode me ajudar, por favor?', 'cotidiano', 'iniciante', 7),
('es', 'Quisiera un café.', 'Eu gostaria de um café.', 'restaurante', 'iniciante', 8),
('es', 'La cuenta, por favor.', 'A conta, por favor.', 'restaurante', 'iniciante', 9),
('es', '¿Qué hora es?', 'Que horas são?', 'cotidiano', 'iniciante', 10),
('es', 'No entiendo.', 'Eu não entendo.', 'cotidiano', 'iniciante', 11),
('es', '¿Puedes repetir eso, por favor?', 'Você poderia repetir isso, por favor?', 'cotidiano', 'iniciante', 12),
('es', '¿Dónde está el baño?', 'Onde fica o banheiro?', 'cotidiano', 'iniciante', 13),
('es', 'Estoy aprendiendo español.', 'Eu estou aprendendo espanhol.', 'estudo', 'iniciante', 14),
('es', 'Este es mi primer viaje al extranjero.', 'Esta é minha primeira viagem ao exterior.', 'viagem', 'intermediario', 15),
('es', 'Necesito reservar una habitación.', 'Eu preciso reservar um quarto.', 'viagem', 'intermediario', 16),
('es', '¿Qué me recomiendas?', 'O que você recomenda?', 'restaurante', 'intermediario', 17),
('es', 'Tengo una reserva.', 'Eu tenho uma reserva.', 'viagem', 'intermediario', 18),
('es', '¿Cómo llego al aeropuerto?', 'Como eu chego ao aeroporto?', 'viagem', 'intermediario', 19),
('es', 'Soy alérgico al maní.', 'Eu sou alérgico a amendoim.', 'saude', 'intermediario', 20),
('es', '¿Podrías hablar más despacio?', 'Você poderia falar mais devagar?', 'cotidiano', 'intermediario', 21),
('es', 'Realmente disfruté esta película.', 'Eu realmente gostei deste filme.', 'lazer', 'intermediario', 22),
('es', '¿Cuáles son tus planes para hoy?', 'Quais são seus planos para hoje?', 'cotidiano', 'intermediario', 23),
('es', 'Espero tu respuesta.', 'Fico no aguardo do seu retorno.', 'trabalho', 'avancado', 24),
('es', 'Fue un placer trabajar contigo.', 'Foi um prazer trabalhar com você.', 'trabalho', 'avancado', 25);
