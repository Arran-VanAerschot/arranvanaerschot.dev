import type { Metadata } from "next";
import { JetBrains_Mono, IBM_Plex_Mono, VT323, Geist_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "arran@ava ~ portfolio",
  description: "Arran Van Aerschot — Junior Software Engineer & Automation Engineer based in Brussels.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${ibmPlexMono.variable} ${vt323.variable} ${geistMono.variable}`}
    >
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
