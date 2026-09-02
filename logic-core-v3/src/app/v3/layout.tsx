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
 *       {children}             ← la página, que trae su propio esqueleto
 *
 * El escenario está acá y no en `page.tsx` justamente por eso: es permanente,
 * no una sección. Sobrevive a la navegación entre páginas de /v3 sin
 * remontarse, que es lo que va a hacer falta cuando haya más de una.
 *
 * ── ⚠️ EL `<main>` SE MUDÓ A LA PÁGINA EN SITIO-S12, Y NO ES UN CAPRICHO ───
 *
 * Hasta S11 este layout envolvía a `{children}` en `<main className="relative
 * z-10">`, y el chrome entero vivía adentro. El defecto 15 de §7.39 pide que la
 * navegación deje de estar anidada en el `<main>` y que el documento tenga
 * `banner`; para eso la pastilla tiene que ser HERMANA del `<main>`, y ahí
 * aparece una consecuencia que sólo se puede evitar desde la PÁGINA:
 *
 * **El apilado contra el preloader.** `<main class="relative z-10">` crea un
 * contexto de apilado. Con la pastilla (`--z-cabecera` = 100) afuera y el
 * overlay del intro (z 9999) adentro, el overlay quedaría **aplastado al 10 del
 * `<main>`** y la pastilla se pintaría ENCIMA del preloader — en la primera
 * visita de la sesión, sin que ningún instrumento lo vea, porque no hay pintura
 * en un render de servidor.
 *
 * Con el `<main>` alrededor de las ocho y no alrededor de todo, la pastilla y el
 * overlay vuelven a compartir contexto y el 9999 gana como antes. Es la razón
 * por la que `page.tsx` compone el esqueleto y este layout se queda con el piso
 * de papel y el escenario.
 *
 * **La propiedad que §7.39 celebra —que el documento TENGA un `<main>`, que la
 * referencia no tiene en cinco de sus seis URLs— no cambia; cambia quién lo
 * pone**, y eso lo verifica `s10-banco` §2 sobre el documento compuesto, que es
 * donde la propiedad vive.
 *
 * ⚠️ **Y el pie NO se mudó, con su medición.** El defecto 6 —el `contentinfo`
 * que falta— pedía el mismo movimiento para el `<footer>`, y SITIO-S12 lo FRENÓ
 * con una cuarta pared que §7.43 no tenía: sacarlo de la `<section id="cierre">`
 * le suma **485 px a 1440 y 735 px a 375** al documento **fuera de la tabla de
 * `secciones.ts`**, y el progreso de la escena sale de
 * `document.documentElement.scrollHeight` (`EscenaDelHome.tsx`). El progreso que
 * hoy vale 0,750 donde el diferencial llena el cuadro pasaría a **0,720 y
 * 0,691**: mueve el anclaje de SITIO-S9 sin tocar una línea del anclaje. Ver
 * §7.46 de `DIRECCION-ESCENA.md`.
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
      {children}
    </div>
  )
}
