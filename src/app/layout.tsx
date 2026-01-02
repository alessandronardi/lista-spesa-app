import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lista della Spesa",
  description: "App collaborativa per liste della spesa in tempo reale. Condividi con un codice, sincronizza istantaneamente.",
  openGraph: {
    title: "Lista della Spesa",
    description: "App collaborativa per liste della spesa in tempo reale. Condividi con un codice, sincronizza istantaneamente.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Lista della Spesa",
    description: "App collaborativa per liste della spesa in tempo reale.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
