import {
  ChapterLabel,
  DisplayHeading,
  MonoLabel,
  RuleDivider,
  SectionShell,
  Subhead,
} from '@/components/design-system'
import { FRENTES, type Frente } from './data'

/**
 * S5 del home — los cuatro frentes. Tema oscuro.
 *
 * Reemplaza a `OurServices.tsx`, el monolito de 9.898 líneas: cuatro paneles
 * con demo animada propia, precios "DESDE", métricas sin fuente y un "Cierre de
 * diagnóstico" al final. Acá quedan cuatro filas y el dato que cada una tiene
 * que dar.
 *
 * **Server Component, cero JS propio.** El reveal es `animate-ds-reveal`, la
 * animación CSS del sistema. El único motion vivo de la página es el panel del
 * lunes (S3); acá no hay ninguno.
 *
 * **Es la única sección del home con los cuatro acentos, y por eso es oscura.**
 * Tres de los cuatro no llegan a 3:1 sobre el lienzo crema (cian 2.10, verde
 * 2.19, ámbar 1.86). La alternancia estricta la habría dejado en crema; se
 * resolvió intercambiándola con los contrastes (S4) en vez de sacarle el color,
 * que es lo único que distingue una fila de otra.
 *
 * **El acento ocupa área.** Pinta el nombre del frente (`Subhead`, hasta 38px)
 * y su plazo, no un tick de 6×6 px. Es la corrección de dosis de B1-S5: con 36
 * px² por fila, sacarle el color a las cuatro casi no perdía información — o
 * sea que no identificaba nada. Sigue sin haber glow, gradiente ni borde
 * lateral de acento: la dosis mínima es de color, no de área.
 *
 * **Sin pricing.** Los módulos y los precios salen del home por decisión D1 y
 * van a una futura página de producto. Sin links a las landings tampoco: el
 * camino home → landing lo sirve el desplegable de servicios del `Navbar`,
 * que las lista las cuatro.
 *
 * `id="servicios"` NO se renombra. Lo consumen `Navbar` (`MAIN_NAV_ITEMS` y
 * `HASH_TO_LABEL`), la tool `navigate_to_page` del chatbot (`VALID_PATHS`) y
 * `TransitionContext`, que está congelado y lo tiene hardcodeado en dos
 * ramas (líneas 28 y 41) para centrar el destino del scroll.
 */

// ─── Pieza ───────────────────────────────────────────────────────────────────

/**
 * Fila de frente. Dos bloques: identidad a la izquierda (nombre + plazo, que es
 * donde vive el acento), y el par para-quién / entregable a la derecha.
 *
 * Los dos párrafos se distinguen por color y no por etiqueta: cuatro filas con
 * dos `MonoLabel` cada una serían ocho etiquetas mono compitiendo con los
 * nombres de los frentes. El problema va en `text-ds-fg-muted` y la solución en
 * `text-ds-fg` — el mismo par que usan los contrastes de S4.
 */
function FrenteRow({ frente, last }: { frente: Frente; last: boolean }) {
  return (
    <div>
      <div className="grid gap-4 py-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-12 md:py-10">
        <div className="flex flex-col items-start gap-3">
          <Subhead accent={frente.service}>{frente.nombre}</Subhead>
          <MonoLabel accent={frente.service}>{frente.timeline}</MonoLabel>
        </div>

        <div className="flex flex-col gap-3">
          <p className="max-w-ds-prose text-ds-body text-ds-fg-muted">{frente.paraQuien}</p>
          <p className="max-w-ds-prose text-ds-body text-ds-fg">{frente.entregable}</p>
        </div>
      </div>

      {last ? null : <RuleDivider />}
    </div>
  )
}

// ─── Sección ─────────────────────────────────────────────────────────────────

export function Servicios() {
  return (
    <SectionShell theme="dark" id="servicios">
      <div className="animate-ds-reveal flex flex-col gap-10 md:gap-14">
        <div className="flex flex-col gap-6">
          {/*
            Número solo, sin título: el formato que fijó B1-S5 para el home. La
            `MonoLabel` de al lado es la etiqueta del contenido, no un segundo
            kicker.
          */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <ChapterLabel number="05" />
            <MonoLabel>Servicios</MonoLabel>
          </div>

          <DisplayHeading size="lg" as="h2">
            Cuatro frentes. Un sistema.
          </DisplayHeading>
        </div>

        {/*
          Reglas arriba y abajo del bloque, y una entre filas: la tabla se cierra
          por los dos extremos en vez de quedar flotando. Sin `gap` entre filas —
          la separación la da el padding vertical de cada una, así la regla toca
          el ancho completo sin huecos.
        */}
        <div className="flex flex-col">
          <RuleDivider />
          {FRENTES.map((frente, index) => (
            <FrenteRow
              key={frente.service}
              frente={frente}
              last={index === FRENTES.length - 1}
            />
          ))}
          <RuleDivider />
        </div>
      </div>
    </SectionShell>
  )
}
