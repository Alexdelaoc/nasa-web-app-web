import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PT_Mono, PT_Sans, PT_Serif } from "next/font/google";
import "./globals.css";

const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

const ptMono = PT_Mono({
  variable: "--font-pt-mono",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NASA Web App · Objetos próximos a la Tierra",
    template: "%s · NASA Web App",
  },
  description:
    "Catálogo consultable de los cuerpos menores que se acercan a la Tierra y de los meteoritos que han llegado a caer, con datos abiertos de la NASA y el JPL.",
  applicationName: "NASA Web App",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "NASA Web App",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${ptSans.variable} ${ptSerif.variable} ${ptMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
