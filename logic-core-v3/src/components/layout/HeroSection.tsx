import { ChapterLabel, DisplayHeading, Eyebrow, Lead, SectionShell } from '@/components/design-system'
import { HeroLogoSlot } from './HeroLogoSlot'

/**
 * Hero del home — S3, hero de dos capas.
 *
 * ⚠ El archivo `Hero.tsx` de al lado es el hero LEGACY (826 líneas: typewriter,
 * canvas full-bleed, scroll lock de ~9,8s). Quedó en disco sin uso —la regla
 * del sprint es no borrar— pero el hero vivo es ESTE. No se edita aquel.
 *
 * Dos capas, deliberadamente desacopladas:
 *
 * 1. **Base tipográfica** (este archivo). Es lo que ven mobile, quien pidió
 *    `prefers-reduced-motion` y cualquiera cuyo canvas no cargue. No es un
 *    placeholder esperando al 3D: es el hero terminado. Server Component — no
 *    lleva `'use client'` ni una línea de JS propia, así que se pinta con el
 *    HTML del documento. El reveal de entrada es una animación CSS del sistema
 *    por la misma razón: si fuese de Framer, el SSR emitiría `opacity:0` y el
 *    hero quedaría en blanco hasta hidratar.
 * 2. **El logo** (`HeroLogoSlot`), que a su vez es SVG 2D siempre presente +
 *    artefacto 3D diferido encima. Ver su docblock.
 *
 * Lo que este hero NO hace, y no debe volver a hacer: bloquear el scroll. El
 * scroll está disponible desde el primer frame, pase lo que pase con el canvas.
 * No hay readiness gate, no hay `PreloaderContext`, no hay fase que esperar —
 * ese acoplamiento es exactamente lo que producía los ~9,8s del hero legacy.
 *
 * `id="inicio"` lo consumen `Navbar` (`MAIN_NAV_ITEMS`, `HASH_TO_LABEL`, el
 * fallback del IntersectionObserver) y `DynamicDock`. No se renombra.
 */
export function HeroSection() {
  return (
    <SectionShell
      theme="light"
      id="inicio"
      // Ritmo vertical propio: el hero reserva abajo el alto del chrome fijo.
      // En `main` el chrome de desktop es `DynamicDock`, que va anclado ABAJO
      // (`fixed bottom-8`) — no hay barra superior fija que esquivar, así que
      // la reserva va toda al pie y arriba queda el aire normal de sección.
      // La reserva se expresa como sección + nav (dos tokens que ya existen) en
      // vez de un valor suelto medido a ojo.
      //
      // `pt-`/`pb-` explícitos y nunca `py-` + `pb-`: el propio docblock de
      // `SectionShell` documenta que `twMerge` NO colapsa `py-*` contra `pb-*`
      // y que quién gana lo decide el orden del CSS emitido.
      spacing="none"
      className="flex min-h-[100svh] items-center pt-ds-section pb-[calc(var(--spacing-ds-section)+var(--spacing-ds-nav))]"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
        {/*
          El reveal va en los HIJOS y no en esta columna. Envolviendo la columna
          entera, el `from { opacity: 0 }` de `ds-reveal` se aplica también al
          titular, y la opacidad de un ancestro multiplica a todo lo que cuelga
          de él: el `h1` —que es el LCP de la página— quedaría transparente
          durante el fade, y Chrome no considera candidato a LCP a un elemento
          transparente. El titular usa `ds-rise`, su compañero sin tramo de
          opacidad: misma distancia, misma duración, misma curva, así que la
          columna entra en lockstep — lo único que cambia es que nace opaco.
        */}
        <div className="flex flex-col lg:col-start-1 lg:row-start-1">
          {/*
            El hero LLEVA número: la sección-como-capítulo es la firma del
            sistema y una portada sin numerar deja el índice arrancando en "01"
            sobre la segunda sección. En la misma fila que el eyebrow y no
            encima — apilados leen como dos kickers en pugna.

            El eyebrow va en grafía natural y no en mayúsculas: el `uppercase`
            lo pone el token, así que se ve idéntico, pero el lector de pantalla
            no deletrea el texto letra por letra.
          */}
          <div className="animate-ds-reveal flex flex-wrap items-center gap-x-6 gap-y-2">
            <ChapterLabel number="01" />
            <Eyebrow>Agencia digital — Tucumán, Argentina</Eyebrow>
          </div>

          <DisplayHeading size="xl" as="h1" className="animate-ds-rise mt-5">
            Tu negocio vendiendo en piloto automático
          </DisplayHeading>

          <Lead className="animate-ds-reveal mt-6">
            Sitios web, automatizaciones e inteligencia artificial para empresas de cualquier rubro.
          </Lead>

          {/*
            Sin CTA de WhatsApp: en el hero es prematuro (decisión del sprint).
            Un enlace discreto hacia abajo alcanza — invita a recorrer en vez de
            pedir una conversación antes de haber mostrado nada.

            Destino `#portfolio` y no `#trabajos`: ese es el id que existe
            (`Portfolio.tsx`) y el que ya consumen el menú y el tool
            `navigateToPage` del chatbot (`/#portfolio` en `VALID_PATHS`).
            `#trabajos` no resuelve porque no existe en ninguna parte —
            "Trabajos" es como se llama la fila en la tabla de S1, no el id. Se
            apunta al id real en vez de renombrar la sección: renombrarla
            rompería el enum del chatbot y el menú, y agregar un segundo id al
            mismo destino repetiría el bug de `#nosotros` duplicado.
          */}
          <p className="animate-ds-reveal mt-10">
            <a
              href="#portfolio"
              className="group inline-flex items-center gap-3 font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted transition-colors duration-[var(--duration-ds-micro)] ease-[var(--ease-ds-shift)] hover:text-ds-fg focus-visible:text-ds-fg"
            >
              Ver nuestros trabajos
              <span aria-hidden="true">↓</span>
            </a>
          </p>
        </div>

        {/*
          En mobile el logo va ARRIBA del texto (`order-first`) y chico: es la
          entrada tipográfica con su marca al frente, no la columna del desktop
          encogida. En `lg` pasa a la segunda columna, a tamaño completo.

          ⚠ Pendiente de diseño (S3b): el 3D ahora carga TAMBIÉN en mobile, y
          acá su caja mide 80px (`w-20`). Montar un contexto WebGL + 1,6 MiB de
          HDRI para renderizar una miniatura es un mal negocio. Si la
          coreografía quiere el logo como protagonista en mobile —como en la
          referencia— este tamaño tiene que crecer. Es una decisión de diseño,
          no se toma acá.
        */}
        <HeroLogoSlot className="order-first w-20 sm:w-24 lg:order-none lg:col-start-2 lg:row-start-1 lg:w-full" />
      </div>
    </SectionShell>
  )
}
