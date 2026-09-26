import type { Metadata, Viewport } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import { CustomCursor } from "@/components/CustomCursor";
import "./globals.css";

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-oswald" });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "SF Motos Alta Performance | Oficina de Moto de Alta Performance em Resende - RJ",
  description:
    "SF Motos Alta Performance: oficina especializada em motos de alta cilindrada em Resende, RJ. Tecnologia, honestidade e transparência em cada atendimento.",
  icons: { icon: { url: "/imgs/logo-sf.png", type: "image/png" } },
};

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: "SF Motos Alta Performance",
  description:
    "Oficina especializada em motos de alta performance e alto padrão em Resende, RJ. Tecnologia, honestidade e transparência.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "R. Dalva Menandro, 34 - Comercial",
    addressLocality: "Resende",
    addressRegion: "RJ",
    postalCode: "27541-180",
    addressCountry: "BR",
  },
  openingHours: "Mo-Sa 08:00-18:00",
  aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", bestRating: "5" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${oswald.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
