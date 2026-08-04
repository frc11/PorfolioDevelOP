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
  metadataBase: new URL("https://develop.com.ar"),
  title: "develOP — Agencia de Desarrollo Digital | Tucumán, Argentina",
  description: "Agencia de desarrollo web, software a medida, automatización e IA en Tucumán y el NOA. Transformamos negocios con tecnología que genera resultados reales.",
  keywords: ["agencia desarrollo web tucumán", "software a medida argentina", "automatización procesos noa", "desarrollo digital tucumán", "agencia digital argentina", "inteligencia artificial pymes"],
  authors: [{ name: "develOP" }],
  creator: "develOP",
  alternates: {
    canonical: "https://develop.com.ar",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://develop.com.ar",
    siteName: "develOP",
    title: "develOP — Agencia de Desarrollo Digital | Tucumán, Argentina",
    description: "develOP — ingeniería de software, automatización con IA y sistemas a medida. Desde Tucumán para todo el país.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "develOP Agencia Digital" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "develOP — Desarrollo Digital en Tucumán",
    description: "develOP — ingeniería de software, automatización con IA y sistemas a medida. Desde Tucumán para todo el país.",
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
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: lo conserva la extensión de navegador / el
    // `data-theme` que `ThemeProvider` escribe en el <html> antes de hidratar.
    // El scroll-lock pre-hidratación que lo justificaba originalmente
    // (`EarlyScrollLock`) se eliminó en B2-S1 junto con el intro del home: el
    // hero nuevo no bloquea el scroll en ningún momento.
    // Las variables de `next/font` van en el <html>, no en el <body>: `globals.css`
    // declara `--font-sans` / `--font-mono` dentro de `@theme`, que Tailwind emite
    // en `:root` (= el <html>). Un custom property se resuelve en el elemento donde
    // se declara, así que `var(--font-geist-sans)` leído desde `:root` no encontraba
    // nada si la variable vivía en el <body> → `--font-sans` quedaba inválida y todo
    // el sitio caía en la fuente del sistema. Con la clase acá, `:root` tiene las dos
    // variables definidas y la cadena resuelve.
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://grainy-gradients.vercel.app" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://placehold.co" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {/*
          `CustomCursor` y `NoiseOverlay` se desmontaron en B2-S2. Los dos
          contradicen la dirección del rediseño: el cursor custom está prohibido
          (y además escondía el del sistema con `cursor:none` global en ≥768px,
          un costo de accesibilidad por un adorno), y el grano animado del noise
          pelea con las superficies planas — corría a `steps(10)` infinito sobre
          todo el viewport, en toda ruta, sin gate de visibilidad.

          Eran las dos únicas piezas montadas globalmente (fuera de
          `PublicOnlyComponents`), así que sacarlas de acá las sacó de todas las
          superficies, producto incluido.

          Los dos archivos ya no existen. `NoiseOverlay.tsx` se borró en el
          sprint de calibración y `CustomCursor.tsx` en B2-S4, por la misma
          razón: desmontados no hacían nada, pero cada uno seguía llevando
          adentro lo que la lista de "Don't" del sistema prohíbe —una animación
          `infinite` a 5 Hz sin gate de `prefers-reduced-motion` uno, un
          `cursor:none` global sobre el cursor del sistema el otro— y bastaba
          con volver a importarlos para reintroducirlo.

          Queda anotado, y NO se resolvió acá: las clases `cursor-none` siguen
          puestas en elementos interactivos de varias pantallas (Portfolio,
          About, las de automatización, el chat). Sin `CustomCursor` montado
          esconden el cursor del sistema sin reemplazarlo por nada.
        */}
        <PreloaderProvider>
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
