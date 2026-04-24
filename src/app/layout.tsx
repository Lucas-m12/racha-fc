import type { Metadata, Viewport } from "next";
import { Anton, Instrument_Serif, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-display-google",
  weight: "400",
  subsets: ["latin"],
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif-google",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans-google",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono-google",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FutCaju — Pelada de Cajueiro",
  description: "Gestão da pelada de sexta: jogadores, partidas, estatísticas e caixa.",
};

export const viewport: Viewport = {
  themeColor: "#0E0D0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${anton.variable} ${instrumentSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <div className="app">{children}</div>
      </body>
    </html>
  );
}
