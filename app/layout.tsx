import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal de Prácticas | Seguimiento de Práctica Profesional",
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
      <body className="font-sans antialiased text-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
