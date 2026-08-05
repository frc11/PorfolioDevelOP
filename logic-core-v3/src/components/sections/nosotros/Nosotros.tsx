import {
  ChapterLabel,
  DisplayHeading,
  MonoLabel,
  RuleDivider,
  SectionShell,
  Subhead,
  Surface,
} from '@/components/design-system'
import { CONTRASTES, INGENIEROS, UBICACION, type Contraste, type Ingeniero } from './data'

/**
 * S4 del home — por qué develOP, y quiénes somos. Tema crema.
 *
 * Fusiona `WhyDevelOP.tsx` (1.726 líneas, tabs, 26 componentes internos, 31
 * animaciones gateadas) y `About.tsx` (528 líneas, dos scrollytelling
 * horizontales de 400vh servidos los dos en el HTML) en una sola sección
 * estática.
 *
 * **Server Component, cero JS propio.** El reveal es `animate-ds-reveal`. Con
 * los dos archivos viejos mueren, en S3, las 31 animaciones y los dos árboles
 * JSX duplicados.
 *
 * **Sin acentos.** La sección corre en crema y tres de los cuatro no llegan a
 * 3:1 sobre ese lienzo. Es la Regla del Acento sobre Oscuro.
 *
 * **Los dos ids conviven, y por primera vez aterrizan donde deben.**
 * `id="caracteristicas"` es el de la sección entera: `TransitionContext` está
 * congelado, lo tiene hardcodeado en dos ramas (líneas 28 y 41) y le da
 * tratamiento especial —centra el destino en el viewport en vez de pegarlo
 * arriba—, así que tiene que ser el contenedor grande y no un bloque interno.
 * `id="nosotros"` va en el bloque del equipo, que es exactamente el contenido
 * que ese link promete.
 *
 * Hoy ese link está roto: `About.tsx` declara `id="nosotros"` DOS veces —una por
 * cada árbol, mobile y desktop, ambos en el DOM— y el primero resuelve a
 * `scrollY: 0`, o sea que "Nosotros" te deja en el hero. Acá el id es uno solo.
 * Lo consumen el `Navbar` (`MAIN_NAV_ITEMS`, `HASH_TO_LABEL`) y la tool
 * `navigate_to_page` del chatbot (`VALID_PATHS`).
 *
 * **El h2 va en el bloque del equipo, no arriba.** La sección construye:
 * primero el argumento (los contrastes, que se explican solos con sus dos
 * etiquetas), después el remate. "Ingenieros, no intermediarios" es la
 * conclusión de las tres filas de arriba y la presentación de las dos personas
 * de abajo; puesto arriba de todo sería un titular que adelanta su propia
 * demostración.
 */

// ─── Piezas ──────────────────────────────────────────────────────────────────

/**
 * Fila de contraste. El lado agencia va en cuerpo y muted; el lado develOP en
 * `Subhead` y a plena tinta.
 *
 * El escalón de tamaño es la corrección de B1-S5: el bloque YA distinguía los
 * dos lados por color, pero saltaba del titular de la sección directo a la mono
 * de 12px sin nada en el medio.
 */
function ContrasteRow({ contraste, last }: { contraste: Contraste; last: boolean }) {
  return (
    <div>
      <div className="grid gap-6 py-7 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col gap-2">
          <MonoLabel>Una agencia</MonoLabel>
          <p className="max-w-ds-prose text-ds-body text-ds-fg-muted">{contraste.agencia}</p>
        </div>

        <div className="flex flex-col gap-2">
          <MonoLabel>develOP</MonoLabel>
          <Subhead as="p">{contraste.develop}</Subhead>
        </div>
      </div>

      {last ? null : <RuleDivider />}
    </div>
  )
}

/**
 * Ficha de ingeniero.
 *
 * El avatar es un placeholder TIPOGRÁFICO —la inicial dentro de una superficie
 * plana— y no un cuadrado vacío: un cuadrado vacío se lee como imagen rota, no
 * como "falta la foto". Va `aria-hidden` porque el nombre está escrito al lado;
 * anunciarlo sería leer la inicial dos veces.
 *
 * `areas` es dato verificado y `rol` es el placeholder. Van en peldaños
 * distintos a propósito: se tiene que poder ver de un vistazo qué está cerrado
 * y qué falta.
 */
function IngenieroCard({ ingeniero }: { ingeniero: Ingeniero }) {
  return (
    <Surface as="li" padding="lg" className="flex flex-col gap-5">
      <div
        aria-hidden="true"
        className="flex size-16 shrink-0 items-center justify-center border border-ds-rule bg-ds-canvas"
      >
        <span className="font-ds-mono text-ds-subhead text-ds-fg-muted">{ingeniero.inicial}</span>
      </div>

      <div className="flex flex-col gap-2">
        <Subhead as="h3">{ingeniero.nombre}</Subhead>
        <MonoLabel>{ingeniero.areas}</MonoLabel>
      </div>

      <p className="text-ds-body text-ds-fg-muted">{ingeniero.rol}</p>
    </Surface>
  )
}

// ─── Sección ─────────────────────────────────────────────────────────────────

export function Nosotros() {
  return (
    <SectionShell theme="light" id="caracteristicas">
      <div className="animate-ds-reveal flex flex-col gap-12 md:gap-16">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <ChapterLabel number="04" />
          <MonoLabel>Por qué develOP</MonoLabel>
        </div>

        {/* ── Bloque A: el argumento ── */}
        <div className="flex flex-col">
          <RuleDivider />
          {CONTRASTES.map((contraste, index) => (
            <ContrasteRow
              key={contraste.id}
              contraste={contraste}
              last={index === CONTRASTES.length - 1}
            />
          ))}
          <RuleDivider />
        </div>

        {/*
          ── Bloque B: quiénes somos ──

          `id` en el bloque y no en la sección: ver la nota de arriba. Lleva
          `scroll-mt` propio para que el ancla no deje el título pegado al borde
          superior ni tapado por el chrome flotante — el `scroll-margin` que
          tienen las secciones no lo hereda un div interno.
        */}
        <div id="nosotros" className="flex scroll-mt-24 flex-col gap-8 md:gap-10">
          <DisplayHeading size="lg" as="h2">
            Ingenieros, no intermediarios.
          </DisplayHeading>

          <ul className="grid gap-6 sm:grid-cols-2">
            {INGENIEROS.map((ingeniero) => (
              <IngenieroCard key={ingeniero.nombre} ingeniero={ingeniero} />
            ))}
          </ul>

          <div className="flex flex-col gap-6">
            <RuleDivider />
            <p className="max-w-ds-prose text-ds-body text-ds-fg-muted">{UBICACION}</p>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
