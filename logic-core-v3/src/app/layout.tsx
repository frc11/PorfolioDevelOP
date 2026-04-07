import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://develop.com.ar"),
  title: "develOP — Agencia de Desarrollo Digital | Tucumán, Argentina",
  description: "Agencia de desarrollo web, software a medida, automatización e IA en Tucumán y el NOA. Transformamos negocios con tecnología que genera resultados reales.",
  keywords: ["agencia desarrollo web tucumán", "software a medida argentina", "automatización procesos noa", "desarrollo digital tucumán", "agencia digital argentina", "inteligencia artificial pymes"],
  authors: [{ name: "develOP" }],
  creator: "develOP",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://develop.com.ar",
    siteName: "develOP",
    title: "develOP — Agencia de Desarrollo Digital | Tucumán, Argentina",
    description: "Desarrollo web, software, automatización e IA para negocios del NOA. +47 empresas potenciadas.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "develOP Agencia Digital" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "develOP — Desarrollo Digital en Tucumán",
    description: "Desarrollo web, software, automatización e IA para negocios del NOA. +47 empresas potenciadas.",
    images: ["/og-image.png"],
  },
};

import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Navbar } from "@/components/layout/Navbar";
import Preloader from "@/components/ui/Preloader";
import { PreloaderProvider } from "@/context/PreloaderContext";
import { TransitionProvider } from "@/context/TransitionContext";
import { Shutter } from "@/components/layout/Shutter";
import { PublicOnlyComponents } from "@/components/layout/PublicOnlyComponents";
import { ClientLogicCompanion } from "@/components/layout/ClientLogicCompanion";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PreloaderProvider>
          <CustomCursor />
          <NoiseOverlay />
          <SmoothScroll>
            <TransitionProvider>
              <PublicOnlyComponents>
                <Shutter />
              </PublicOnlyComponents>
              {children}
              <PublicOnlyComponents>
                <Navbar />
              </PublicOnlyComponents>
            </TransitionProvider>
          </SmoothScroll>
          <PublicOnlyComponents>
            <Preloader />
            <ClientLogicCompanion />
          </PublicOnlyComponents>
          <Toaster 
            theme="dark" 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: '#090a0f',
                border: '1px solid rgba(255,255,255,0.05)',
                color: '#fff',
              },
              className: 'shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl',
            }} 
          />
        </PreloaderProvider>
      </body>
    </html>
  );
}
