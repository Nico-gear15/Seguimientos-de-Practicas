import type { Metadata } from "next";

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
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
