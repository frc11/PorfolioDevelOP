import localFont from 'next/font/local'

import { EscenarioCompuerta } from './_componentes/EscenarioCompuerta'

/* ── LAS HOJAS DEL CHROME (S3) ───────────────────────────────────────────────
 * Cinco archivos y no uno: la regla del repo parte a las 300 líneas, y cada
 * pieza se revisa entera de una sentada. Se importan acá y no desde los
 * componentes por dos razones. La primera es de alcance: son las hojas del
 * árbol de /v3 y este layout es su frontera. La segunda es de instrumentos —
 * un componente que importa un `.css` no se puede cargar desde una
 * comprobación con `tsx`, que no sabe qué hacer con una hoja de estilos; con
 * los componentes limpios, los invariantes los renderizan y afirman sobre el
 * marcado de verdad.
 *
 * Todos los selectores empiezan por `[data-v3]`: nada de esto puede tocar el
 * sitio vivo, y hay una comprobación que lo afirma archivo por archivo.
 * ────────────────────────────────────────────────────────────────────────── */
import './_estilos/cta.css'
import './_estilos/navegacion.css'
import './_estilos/cursor.css'
import './_estilos/pie.css'
import './_estilos/foco.css'

/**
 * EL ESQUELETO DEL SITIO v3 — canvas permanente + paneles encima.
 *
 * ── El hallazgo estructural ────────────────────────────────────────────────
 *
 * La referencia NO es una pila de secciones con fondo: es **un canvas
 * permanente a viewport completo con paneles de DOM deslizándose encima**. Eso
 * explica de una sola vez cinco mediciones que no cerraban, y tiene una
 * consecuencia que vale más que la explicación: **la capa 3D se enchufa y se
 * desenchufa sin tocar el resto.**
 *
 *     <div data-v3>            ← el piso de papel
 *       <EscenarioCompuerta/>  ← canvas fijo, viewport completo, z-0
 *       <main>                 ← el flujo del documento, z-10
 *
 * El escenario está acá y no en `page.tsx` justamente por eso: es permanente,
 * no una sección. Sobrevive a la navegación entre páginas de /v3 sin
 * remontarse, que es lo que va a hacer falta cuando haya más de una.
 *
 * ── El piso de papel ───────────────────────────────────────────────────────
 *
 * El envoltorio pinta `bg-fondo`. No es decoración: es lo que ve un panel
 * `papel-transparente` cuando NO hay escenario, o sea abajo de la compuerta de
 * 1025. Sin el piso, ahí se vería el `<body>` del sitio viejo. Con él, cruzar
 * el umbral cambia lo que se ve a través del panel transparente —papel abajo,
 * escenario arriba— sin cambiar ni una caja.
 *
 * ── Las fuentes ────────────────────────────────────────────────────────────
 *
 * Chivo y Chivo Mono AUTO-HOSPEDADAS con `next/font/local`, con los binarios
 * EXACTOS de S0 (`_fuentes/`). No `next/font/google`.
 *
 * La razón es de trazabilidad, no de rendimiento: las métricas sobre las que
 * descansa el sistema —x-height 511, cap height 686, factor 0,998 contra
 * Instrument Sans— se midieron sobre ESOS archivos. Si el proyecto sirviera
 * otros binarios, el sistema descansaría sobre una medición que no corresponde
 * a lo que el usuario descarga. `fuentes.invariant.ts` recalcula el sha256 de
 * los dos archivos y lo compara contra el manifiesto de descarga de S0.
 *
 * `weight: '100 900'` porque son variables, con eje `wght`: el peso 300, que
 * el sistema de Franco no tenía, existe acá. Un solo archivo por familia, no
 * uno por peso.
 *
 * Subset `latin` solamente. El `css2` capturado por S0 muestra que cubre
 * `U+0000-00FF …`, que contiene todo lo que necesita el español rioplatense
 * (á é í ó ú ü ñ ¿ ¡). `latin-ext` y `vietnamese` no hacen falta, y
 * `next/font/local` no permite declarar `unicode-range` por cara, así que
 * incluirlos sería peso muerto sin forma de acotarlo.
 *
 * ⚠ Las variables se declaran en ESTE envoltorio, no en el `<html>`. Es
 * deliberado: el `<html>` sigue teniendo las de `next/font/google` que usa
 * todo el sitio vivo, y este sprint no lo toca. Los tokens `--font-titulo`,
 * `--font-cuerpo` y `--font-codigo` de `theme-develop.css` referencian
 * `var(--font-v3-chivo…)`; una custom property se sustituye en el elemento que
 * la USA, así que adentro de este árbol la cadena resuelve y afuera cae al
 * fallback. Eso es correcto — afuera todavía gobierna el sistema viejo.
 * Consecuencia anotada y no resuelta acá: `/v3` sirve las dos familias, la
 * de Google (que baja por el layout raíz, en toda ruta) y la local. Se
 * resuelve solo el día que /v3 reemplace al home y el layout raíz pase a
 * `next/font/local`.
 *
 * ── `data-v3` ─────────────────────────────────────────────────────────────
 *
 * Es el alcance del anillo de foco. La regla vive en `theme-develop.css` y
 * está acotada a este árbol; el porqué está escrito ahí, con el número.
 *
 * ── Lo que NO hay acá ──────────────────────────────────────────────────────
 *
 * Ninguna animación. Ni la escena 3D. Ni contenido. Ni GSAP, ni Lenis, ni
 * Sanity: ninguna decidida. Este layout es un hueco y una tipografía.
 */

const chivo = localFont({
  src: './_fuentes/chivo-latin.woff2',
  variable: '--font-v3-chivo',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
})

const chivoMono = localFont({
  src: './_fuentes/chivo-mono-latin.woff2',
  variable: '--font-v3-chivo-mono',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
})

export default function DisposicionV3({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-v3=""
      className={`${chivo.variable} ${chivoMono.variable} font-cuerpo bg-fondo text-tinta relative min-h-svh`}
    >
      <EscenarioCompuerta />
      <main className="relative z-10">{children}</main>
    </div>
  )
}
