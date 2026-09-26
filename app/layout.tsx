import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SF Motos Alta Performance",
  description: "Oficina de moto de alta performance em Resende, RJ.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
