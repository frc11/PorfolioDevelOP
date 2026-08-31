import type { Metadata } from "next";
import { Chivo, Chivo_Mono } from "next/font/google";
import "./globals.css";

const chivoSans = Chivo({
  variable: "--font-chivo-sans",
  subsets: ["latin"],
});

const chivoMono = Chivo_Mono({
  variable: "--font-chivo-mono",
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
// ⚠ SITIO-S8 · frente `peso`. **Lo único que cambió en este archivo es esta
// línea, y cambió el ESPECIFICADOR, no el componente.** `HomeIntroBoot` es la
// MISMA función: `@/components/layout/HomeIntro` la re-exporta con
// `export { HomeIntroBoot } from './home-intro/introBoot'`. Mismo render, mismo
// `<script>` pre-paint, mismo lugar en el `<head>`, cero `dynamic`, cero
// `ssr:false`.
//
// Por qué: `HomeIntro.tsx` es el BARRIL del preloader del home — además de
// re-exportar el gate, define `HomeIntro`, que importa el overlay, el motor y
// la línea de tiempo. `src/app/page.tsx` lo importa, así que webpack lo puso en
// el grupo de chunks de la PÁGINA DEL HOME. Pedirle el gate al barril desde el
// layout RAÍZ hacía que la referencia de cliente del layout arrastrara ese
// grupo entero — `static/chunks/app/page-*.js` incluido — a la carga inicial de
// TODA ruta: `/contact`, `/login`, las cuatro landings de servicio, `/v3`.
//
// Medido sobre el build de la línea de base (commit 09113f42): los cuatro
// archivos del grupo están en las ONCE rutas prerenderizadas, y en OCHO de
// ellas —`/contact`, `/login`, `/forgot-password`, `/probe-escena` y las cuatro
// landings— el ÚNICO que los pide es `HomeIntroBoot`: **4 archivos · 303,6 KiB
// crudo · 71,4 KiB gzip**. En `/styleguide` son 2 de 4 (268,6 · 59,7): los
// otros dos los comparte con sus propios bloques del sistema de diseño. En `/`
// el grupo es suyo. El instrumento es `test:s8-peso`, que lo publica por ruta
// con el nombre de quién pide cada chunk.
//
// Apuntar al módulo real deja al layout con la dependencia que de verdad usa
// —`introBoot` sólo pide `react`, `next/navigation`, `introHandoff` y
// `introRutas`— y no toca a `src/app/page.tsx`, que sigue pidiendo `HomeIntro`
// al barril porque es el componente que monta.
import { HomeIntroBoot } from "@/components/layout/home-intro/introBoot";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: dos razones. (1) El <script> de HomeIntroBoot
    // marca `data-home-intro` en el <html> ANTES de hidratar (gate pre-paint
    // del preloader del home, S3 — reemplazó al overflow:hidden de
    // EarlyScrollLock, que bloqueaba el scroll) mientras el SSR no lo trae →
    // mismatch legítimo y esperado SOLO en atributos del <html>. (2) El
    // `data-theme` que `ThemeProvider` escribe en el <html> antes de hidratar.
    // Es shallow (un nivel): no enmascara mismatches de los hijos.
    // Las variables de `next/font` van en el <html>, no en el <body>: `globals.css`
    // declara `--font-sans` / `--font-mono` dentro de `@theme`, que Tailwind emite
    // en `:root` (= el <html>). Un custom property se resuelve en el elemento donde
    // se declara, así que `var(--font-chivo-sans)` leído desde `:root` no encontraba
    // nada si la variable vivía en el <body> → `--font-sans` quedaba inválida y todo
    // el sitio caía en la fuente del sistema. Con la clase acá, `:root` tiene las dos
    // variables definidas y la cadena resuelve.
    <html
      lang="es"
      className={`${chivoSans.variable} ${chivoMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://grainy-gradients.vercel.app" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://placehold.co" crossOrigin="anonymous" />
        <HomeIntroBoot />
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

          Las clases `cursor-none` y los `cursor: 'none'` sueltos que quedaban
          repartidos por las pantallas se barrieron después, en su propio paso:
          escondían el cursor del sistema sin reemplazarlo por nada. Única
          excepción: `PortfolioWebCases.tsx` conserva el suyo porque ahí sí hay
          un reemplazo visual propio ("Ver Proyecto") que sigue al puntero — y
          además hoy ese componente no lo importa nadie.
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
          {/* S3: el intro del HOME lo maneja HomeIntro (montado en la página
              del home); acá el orquestador viejo queda SOLO por su rama de
              marketing (Route B — MarketingIntro en las landings). Con
              isHomePage=false su rama home no corre ni renderiza el velo. */}
          <PublicOnlyComponents>
            <Preloader isHomePage={false} />
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
