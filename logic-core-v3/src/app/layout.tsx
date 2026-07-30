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
import { ChatWidgetMount } from "@/components/layout/ChatWidgetMount";
import { EarlyScrollLock } from "@/components/layout/EarlyScrollLock";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: el <script> de abajo setea overflow:hidden en el
    // <html> ANTES de hidratar (scroll-lock temprano del intro en home), mientras
    // el SSR no lo trae → mismatch legítimo y esperado SOLO en el style del <html>.
    // Es shallow (un nivel): no enmascara mismatches de los hijos.
    // Las variables de `next/font` van en el <html>, no en el <body>: `globals.css`
    // declara `--font-sans` / `--font-mono` dentro de `@theme`, que Tailwind emite
    // en `:root` (= el <html>). Un custom property se resuelve en el elemento donde
    // se declara, así que `var(--font-geist-sans)` leído desde `:root` no encontraba
    // nada si la variable vivía en el <body> → `--font-sans` quedaba inválida y todo
    // el sitio caía en la fuente del sistema. Con la clase acá, `:root` tiene las dos
    // variables definidas y la cadena resuelve.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://grainy-gradients.vercel.app" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://placehold.co" crossOrigin="anonymous" />
        <EarlyScrollLock />
      </head>
      <body className="antialiased">
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
          <ChatWidgetMount />
        </PreloaderProvider>
      </body>
    </html>
  );
}
