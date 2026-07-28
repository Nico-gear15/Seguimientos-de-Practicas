import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seguimiento de práctica profesional",
  description: "Plataforma de seguimiento mensual de práctica profesional",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
