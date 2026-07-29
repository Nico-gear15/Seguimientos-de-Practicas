import type { Metadata } from "next";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Seguimiento de práctica profesional",
  description: "Plataforma de seguimiento mensual de práctica profesional",
};

const scriptAntiParpadeo = `
(function () {
  try {
    var guardado = localStorage.getItem('theme');
    var prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var oscuro = guardado ? guardado === 'dark' : prefiereOscuro;
    if (oscuro) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptAntiParpadeo }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
