import "./globals.css";

export const metadata = {
  title: "Fala Aí — pratique pronúncia de inglês e espanhol",
  description: "Ouça, repita e grave sua pronúncia em inglês e espanhol.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink font-body">{children}</body>
    </html>
  );
}
