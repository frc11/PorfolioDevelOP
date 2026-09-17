import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { RAIZ } from './s4-corrida'
import { quitarComentarios } from './s3-escaneo'
import {
  ATRIBUTO_DEL_VELO,
  DURACION_DEL_DESLIZAMIENTO_S,
  SELECTOR_DEL_CTA_DEL_HERO,
  SELECTOR_DEL_MAIN,
  deberiaDeslizar,
} from '../../_componentes/deslizamiento'
import { deberiaCorrerElScrollSuave } from '../scrollSuave'
import { BORDE_INFERIOR_EN_REPOSO_PX } from '../navegacion'
import type { IntroStage } from '@/components/layout/home-intro/introHandoff'
import { marcar } from '../../_secciones/_invariantes/render'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { Hero } from '../../_secciones/hero/Hero'
import { CONTENIDO } from '../../_secciones/hero/contenido'
import { seccionPorId } from '../secciones'
import {
  CURVA_DEL_DESLIZAMIENTO,
  EXPO_OUT_CANONICO,
  LINEA_DE_LA_CURVA_EN_EL_SITIO_VIVO,
} from './s18-curva'

/**
 * DESLIZAR-1 (suite s18) · EL DESLIZAMIENTO DEL CTA DEL HERO.
 *
 * ── Por qué entra a la suite `s18` y no abre una nueva ─────────────────────
 *
 * Porque es la suite de las COMPUERTAS, y este sprint no agrega una: **consume
 * las dos que B5 ya puso**. El deslizamiento vive adentro del módulo perezoso
 * que `deberiaCorrerElScrollSuave` monta, así que la tabla de verdad que §2 de
 * `s18-compuertas` recorre es también la de acá, sin una fila nueva. Abrir una
 * suite habría movido `verificar` de 30 pasos a 31 por una pieza que cuelga de
 * una decisión ya custodiada.
 *
 * ── Qué custodia, y qué NO ────────────────────────────────────────────────
 *
 * Custodia la mecánica: el destino, la curva, la reversibilidad y quién puede
 * disparar el viaje. **No custodia la coreografía** —si el viaje «se siente
 * bien» lo dice el humano con una grabación— y no puede: el gesto no existe en
 * un render de servidor.
 *
 * ⚠️ Y hay una cosa que este archivo NO PUEDE afirmar, y por eso no lo intenta:
 * que la rueda cancele. Eso pide un navegador con una instancia de Lenis viva y
 * un gesto de verdad; lo miden los tres controles positivos de
 * `scripts-deslizar/` y lo cierra el humano. Lo que sí se afirma acá es la
 * ESTRUCTURA que hace que la cancelación sea posible: `lock: false`, que nadie
 * llame `stop()`, y que el velo no cuelgue de un `onComplete` que en una
 * cancelación no dispara.
 */

const leer = (relativo: string): string => readFileSync(path.join(RAIZ, relativo), 'utf8')

const MODULO = 'src/app/v3/_componentes/deslizamiento.ts'
const EFECTO = 'src/app/v3/_componentes/useDeslizamientoDelCta.ts'
const MOTOR = 'src/app/v3/_componentes/ScrollSuaveDeV3.tsx'
const HOJA = 'src/app/v3/_estilos/deslizamiento.css'
const COMPUERTA = 'src/app/v3/_componentes/CompuertaDelScrollSuave.tsx'
const SITIO_VIVO = 'src/components/layout/SmoothScroll.tsx'
const RELEVO_DEL_INTRO = 'src/components/layout/home-intro/introBoot.tsx'
const LIBRERIA = 'node_modules/lenis/dist/lenis.mjs'

const veces = (texto: string, aguja: string): number => texto.split(aguja).length - 1

const quieto = marcar(<Hero seccion={seccionDe('hero')} />, { anima: false })

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · UN solo enlace: el CTA del hero, y el selector no es un literal suelto')

afirmarIgual(
  SELECTOR_DEL_CTA_DEL_HERO,
  '[data-panel="hero"] a[data-pieza="cta"]',
  'el selector se arma de `ATRIBUTO_DE_PANEL` y de la PRIMERA fila de `secciones.ts`',
)
afirmar(
  !/\[data-panel="hero"\]/.test(quitarComentarios(leer(MODULO))),
  '  y no está escrito a mano: si alguien reordena la tabla, el selector se mueve con ella',
)
/**
 * ⚠ `data-pieza` es un literal del marcado y no hay constante que lo publique.
 * Mientras no la haya, la desincronización se evita como `trabajos.invariant`
 * §1b evita la del `data-panel` de `Panel.tsx`: afirmando que la cadena del
 * selector aparece LITERALMENTE en el fuente que la emite.
 */
afirmar(
  leer('src/app/v3/_componentes/chrome/Cta.tsx').includes('data-pieza="cta"'),
  '  y la otra mitad la EMITE `Cta.tsx`, con esa cadena exacta en su fuente',
)
afirmar(
  quieto.includes('data-panel="hero"') && quieto.includes('data-pieza="cta"'),
  'las dos mitades del selector están en el marcado servido del hero',
)
afirmarIgual(veces(quieto, '<a '), 1, '  y la sección tiene UN solo `<a>`: el selector no puede resolver a dos')
afirmar(
  quieto.includes(`href="${CONTENIDO.cta.destino}"`),
  `  que apunta a ${CONTENIDO.cta.destino}`,
)
afirmarIgual(
  seccionPorId(CONTENIDO.cta.destino.slice(1)).id,
  'trabajos',
  '  y ese ancla es una sección REAL de la tabla, no un destino inventado',
)
/** El `<a>` del Cierre lleva el MISMO `data-pieza` y queda afuera por el ancestro. */
afirmar(
  leer('src/app/v3/_secciones/cierre/Cierre.tsx').includes('CtaEnlace'),
  'el Cierre tiene su propio `CtaEnlace`: el filtro tiene que ser el ancestro, no el `data-pieza`',
)
afirmar(
  SELECTOR_DEL_CTA_DEL_HERO.startsWith('[data-panel='),
  '  y lo es: el selector arranca por el panel',
)
controlPositivo(
  'el lector de marcado no está ciego: en un hero sin CTA no encuentra el `data-pieza`',
  '<section data-panel="hero"></section>',
  (html: string) => html.includes('data-pieza="cta"'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La compuerta del intro, tabla de verdad ENTERA — y por qué no es `=== clear`')

const ETAPAS: readonly [IntroStage, boolean][] = [
  ['idle', true],
  ['covering', false],
  ['revealing', false],
  ['clear', true],
]
for (const [etapa, esperado] of ETAPAS) {
  afirmarIgual(deberiaDeslizar(etapa), esperado, `intro en \`${etapa}\` → desliza ${esperado}`)
}
/**
 * 🔴 LA FILA QUE DESMIENTE LA FORMA DE LA INSTRUCCIÓN, con su evidencia al lado.
 *
 * Gatear sobre `etapa === 'clear'` cumple la letra y rompe el pedido: cuando el
 * intro NO corre, la etapa se queda en `'idle'` PARA SIEMPRE y el botón no
 * deslizaría nunca más en esa pestaña. La prueba no es una opinión — es la línea
 * de `introBoot.tsx` que sólo publica `'clear'` si la escena estaba retenida.
 */
afirmar(
  deberiaDeslizar('idle'),
  '🔴 con el intro salteado (`idle`) el deslizamiento SÍ corre: es la visita repetida, y es la mayoría',
)
afirmar(
  quitarComentarios(leer(RELEVO_DEL_INTRO)).includes("if (isSceneHeld()) setIntroStage('clear')"),
  "  y la evidencia de por qué `=== 'clear'` no servía: `markIntroPlayed` publica `'clear'` SÓLO si la escena estaba retenida",
)
afirmar(
  !/=== 'clear'|=== "clear"/.test(quitarComentarios(leer(MODULO)) + quitarComentarios(leer(EFECTO))),
  '  y ni el módulo ni el efecto comparan contra `clear`: consumen `isSceneHeld`, que es el booleano publicado para esta pregunta',
)
afirmar(
  quitarComentarios(leer(MODULO)).includes('isSceneHeld'),
  '  la compuerta IMPORTA el booleano del intro en vez de reescribir sus dos etapas',
)
controlPositivo(
  'la tabla no da siempre lo mismo: si diera, no sería una compuerta',
  'covering' as IntroStage,
  (etapa: IntroStage) => deberiaDeslizar(etapa),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Las DOS compuertas de B5, heredadas y no reescritas')

afirmar(
  quitarComentarios(leer(MOTOR)).includes('useDeslizamientoDelCta(instancia)'),
  'el deslizamiento lo monta `ScrollSuaveDeV3`, que es el módulo perezoso detrás de la compuerta',
)
afirmar(
  quitarComentarios(leer(COMPUERTA)).includes('deberiaCorrerElScrollSuave'),
  '  y esa compuerta sigue siendo `deberiaCorrerElScrollSuave`: el deslizamiento hereda las dos filas de una',
)
afirmarIgual(
  deberiaCorrerElScrollSuave(false, false),
  false,
  '  abajo de 1025 no se monta nada: el click es el ancla nativa',
)
afirmarIgual(
  deberiaCorrerElScrollSuave(true, true),
  false,
  '  y con `prefers-reduced-motion` tampoco: salto instantáneo, que es lo de hoy',
)
/** Lo que hace que la compuerta signifique algo del lado del BUILD. */
afirmar(
  !/from '.*useDeslizamientoDelCta'/.test(quitarComentarios(leer('src/app/v3/layout.tsx'))),
  'el layout NO lo importa: si lo hiciera, el chunk viajaría en toda carga inicial y la compuerta 1 no compraría nada',
)
const consumidores = ['src/app/v3/layout.tsx', 'src/app/v3/page.tsx', COMPUERTA, MOTOR].filter((a) =>
  quitarComentarios(leer(a)).includes('useDeslizamientoDelCta'),
)
afirmarIgual(consumidores, [MOTOR], '  y tiene UN solo consumidor en todo el árbol de montaje')
afirmar(
  !quitarComentarios(leer(MOTOR)).includes('useState'),
  '  la instancia viaja por `ref` y no por estado: el módulo perezoso sigue sin renderizar nada',
)
controlPositivo(
  'el detector de import estático no está ciego',
  "import { useDeslizamientoDelCta } from './useDeslizamientoDelCta'",
  (f: string) => !/from '.*useDeslizamientoDelCta'/.test(f),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La curva y la duración: `expoOut` heredado, T = 2,0 s')

afirmarIgual(DURACION_DEL_DESLIZAMIENTO_S, 2, 'la duración son 2,0 SEGUNDOS — la unidad que `scrollTo` espera')
afirmar(
  quitarComentarios(leer(EFECTO)).includes('duration: DURACION_DEL_DESLIZAMIENTO_S'),
  '  y el efecto la consume del módulo, no escribe un 2',
)
afirmar(
  !/easing/.test(quitarComentarios(leer(MODULO)) + quitarComentarios(leer(EFECTO))),
  'el deslizamiento NO declara curva: `scrollTo` hereda la de `OPCIONES_DE_LENIS` cuando no se le pasa una',
)
afirmar(
  leer(SITIO_VIVO).includes(LINEA_DE_LA_CURVA_EN_EL_SITIO_VIVO),
  '  y la que hereda es la del sitio vivo, con esta línea exacta',
  LINEA_DE_LA_CURVA_EN_EL_SITIO_VIVO,
)
/**
 * ⚠ Que la línea diga eso no prueba que sea un expoOut: lo prueba muestrearla.
 * Se compara la forma de la librería contra el expoOut CANÓNICO en toda la
 * ventana abierta. El `1,001` y el `min` le hacen tocar el 1 antes del final, y
 * ése es todo el desvío: acotado, y medido.
 */
let desvioMaximo = 0
for (let i = 0; i <= 100; i += 1) {
  const t = i / 100
  desvioMaximo = Math.max(desvioMaximo, Math.abs(CURVA_DEL_DESLIZAMIENTO(t) - EXPO_OUT_CANONICO(t)))
}
afirmar(
  desvioMaximo < 0.002,
  '  y muestreada ES un expoOut: pega con la forma cerrada en las 101 muestras',
  `desvío máximo ${desvioMaximo.toFixed(6)} — es el \`1,001\` de escala de la librería, nada más`,
)
afirmarIgual(CURVA_DEL_DESLIZAMIENTO(1), 1, '  y llega exactamente a 1: el viaje no se queda corto')
controlPositivo(
  'el comparador de familia no está ciego: una curva LINEAL no pasa por expoOut',
  (t: number) => t,
  (otra: (t: number) => number) => {
    let peor = 0
    for (let i = 0; i <= 100; i += 1) peor = Math.max(peor, Math.abs(otra(i / 100) - EXPO_OUT_CANONICO(i / 100)))
    return peor < 0.002
  },
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El destino es EL ANCLA NATIVA — no un número, no `router.push`')

afirmar(
  quitarComentarios(leer(EFECTO)).includes('lenis.scrollTo(seccion, {'),
  '`scrollTo` recibe el ELEMENTO: el destino lo calcula la librería, no el sprint',
)
const FUENTE_DEL_SPRINT = [MODULO, EFECTO, MOTOR].map((a) => quitarComentarios(leer(a))).join('\n')
afirmar(!/router\.push|useRouter/.test(FUENTE_DEL_SPRINT), '  y no hay `router.push` ni `useRouter` en el sprint')
afirmar(
  !/triggerTransition|TransitionContext/.test(FUENTE_DEL_SPRINT),
  '  ni `triggerTransition`: `TransitionContext` sigue congelado y sigue viendo `null` en /v3',
)
afirmar(
  !/\b8568\b|\b8640\b/.test(FUENTE_DEL_SPRINT),
  '  y ningún píxel de destino escrito a mano: el 8.568 es una MEDICIÓN, no una constante',
)
/**
 * ⚠️ LA PROPIEDAD DE TERCEROS DE LA QUE DEPENDE TODO ESTO, AFIRMADA Y NO SUPUESTA.
 *
 * Que `scrollTo` sea «el mismo mecanismo que los quince enlaces» descansa en dos
 * líneas de `lenis@1.3.25`: que descuente el `scroll-padding-top` del contenedor
 * de scroll, y que ese contenedor sea el `<html>` cuando el `wrapper` es
 * `window`. Si una actualización las cambia, el deslizamiento aterrizaría 72 px
 * más abajo que los otros catorce y nada más se pondría rojo.
 */
const LIBRO = leer(LIBRERIA)
afirmar(
  LIBRO.includes('const scrollPadding = this.isHorizontal ? Number.parseFloat(containerStyle.scrollPaddingLeft) : Number.parseFloat(containerStyle.scrollPaddingTop);'),
  '`scrollTo` DESCUENTA el `scroll-padding-top` del contenedor: es el mecanismo del ancla, no una imitación',
)
afirmar(
  LIBRO.includes('return this.options.wrapper === window ? document.documentElement : this.options.wrapper;'),
  '  y el contenedor es el `<html>`, que es quien lleva la regla de /v3',
)
afirmar(
  !/wrapper/.test(quitarComentarios(leer(SITIO_VIVO)).split('OPCIONES_DE_LENIS')[1] ?? ''),
  '  y `OPCIONES_DE_LENIS` no declara `wrapper`: cae en `window`, que es la rama de arriba',
)
afirmar(
  leer('src/app/v3/_estilos/navegacion.css').includes('scroll-padding-top'),
  `  la regla que lee son los ${BORDE_INFERIOR_EN_REPOSO_PX} px de \`navegacion.css\`, los mismos de los quince enlaces`,
)
afirmarIgual(BORDE_INFERIOR_EN_REPOSO_PX, 72, '  y siguen siendo 72, derivados de los cuatro tokens de la pastilla')
controlPositivo(
  'el detector de destino escrito a mano no está ciego',
  'lenis.scrollTo(8568, {})',
  (f: string) => !/\b8568\b/.test(f),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · EL VELO — reversible por construcción, y con el `inert` acotado a un archivo')

afirmarIgual(ATRIBUTO_DEL_VELO, 'data-v3-deslizando', 'el velo es un ATRIBUTO del `<main>`, no una clase')
afirmarIgual(SELECTOR_DEL_MAIN, '[data-v3] main', '  y el `<main>` se busca acotado al árbol de /v3')
const CSS = leer(HOJA)
/**
 * La `transition` va en la regla de REPOSO y no en la del estado. Es lo que hace
 * que sacar el atributo devuelva la opacidad con la misma curva: el velo se
 * apaga solo, sin depender de un `onComplete` que en una cancelación no dispara.
 */
const reposo = CSS.slice(CSS.indexOf('[data-v3] main {'), CSS.indexOf(`[data-v3] main[${ATRIBUTO_DEL_VELO}]`))
afirmar(reposo.includes('transition: opacity'), 'la `transition` vive en la regla de REPOSO: la vuelta se anima igual que la ida')
afirmar(!reposo.includes('opacity: 0'), '  y el reposo NO apaga nada: sin el atributo el `<main>` se ve')
const prendido = CSS.slice(CSS.indexOf(`[data-v3] main[${ATRIBUTO_DEL_VELO}]`))
afirmar(prendido.includes('opacity: 0'), '  el estado prendido apaga')
afirmar(prendido.includes('will-change: opacity'), '  y declara `will-change` SÓLO prendido: no deja una capa promovida para siempre')
afirmar(!reposo.includes('will-change'), '    el reposo no lo lleva')
afirmar(
  !/transition[^;]*;/.test(prendido),
  '    y no redeclara la transición: una sola definición del tiempo del velo',
)

/**
 * 🔴 `opacity: 0` NO ALCANZA, y el `inert` es la otra mitad. Lo que se afirma acá
 * es que ese atributo **no viaja en el marcado**: se pone y se saca desde UN
 * archivo, en tiempo de ejecución. Por eso los censos de `s10-acceso` —19
 * paradas, 27 encabezados, 11 landmarks— siguen midiendo el documento EN REPOSO
 * y siguen siendo ciertos. No es que el banco esté ciego: mide otra cosa.
 */
afirmar(quitarComentarios(leer(EFECTO)).includes('zona.inert = true'), 'el `<main>` se pone INERTE: un `<main>` transparente sigue siendo tabulable')
afirmar(quitarComentarios(leer(EFECTO)).includes('zona.inert = false'), '  y se despierta en la MISMA función que apaga el velo')
const ARBOL_DE_V3 = [MODULO, EFECTO, MOTOR, COMPUERTA, 'src/app/v3/page.tsx', 'src/app/v3/layout.tsx', HOJA]
const conInerte = ARBOL_DE_V3.filter((a) => /\binert\b/.test(quitarComentarios(leer(a))))
afirmarIgual(conInerte, [EFECTO], '  y el `inert` vive en UN solo archivo: no hay una segunda definición del apagado')
afirmar(!/\binert\b/.test(quieto), '  y no aparece en el marcado servido del hero: los censos de S10 no cambian de número')
controlPositivo(
  'el detector de `inert` en el marcado no está ciego',
  '<section inert><a href="#x">x</a></section>',
  (html: string) => !/\binert\b/.test(html),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · LA REVERSIBILIDAD: cinco salidas, una función, y nadie llama `stop()`')

const EFECTO_LIMPIO = quitarComentarios(leer(EFECTO))
afirmarIgual(veces(EFECTO_LIMPIO, 'const terminar ='), 1, 'hay UNA sola función que apaga el velo')
afirmarIgual(veces(EFECTO_LIMPIO, 'terminar('), 5, '  y exactamente CINCO sitios la llaman: una por salida, ni una suelta')
afirmar(EFECTO_LIMPIO.includes('if (!enVuelo) return'), '  y es IDEMPOTENTE: la segunda llamada no hace nada')
afirmar(EFECTO_LIMPIO.includes('onComplete: () => terminar(true)'), '  salida 1 — llegó')
afirmar(EFECTO_LIMPIO.includes("lenis.on('virtual-scroll'"), '  salida 2 — la rueda: el evento se emite ANTES de todas las guardas de `onVirtualScroll`')
afirmar(EFECTO_LIMPIO.includes("window.addEventListener('popstate'"), '  salida 3 — el botón de atrás a mitad de vuelo')
afirmar(EFECTO_LIMPIO.includes('window.setTimeout(() => terminar(false)'), '  salida 4 — el reloj, que es la única que corre con la pestaña tapada')
afirmar(/return \(\) => \{[\s\S]*terminar\(false\)/.test(EFECTO_LIMPIO), '  salida 5 — la limpieza: desmontar no deja un `<main>` inerte')
afirmar(EFECTO_LIMPIO.includes('lock: false'), 'el viaje va con `lock: false`, EXPLÍCITO: es lo que deja entrar la rueda por el camino normal de Lenis')
afirmar(
  LIBRO.includes('this.scrollTo(this.targetScroll + delta, {') && LIBRO.includes('programmatic: false,'),
  '  y ése es el camino: la rueda termina en `scrollTo(targetScroll + delta, { programmatic: false })`',
)
afirmar(
  LIBRO.includes('this.onUpdate = onUpdate;'),
  '  que reemplaza `onUpdate` entero — por eso el `onComplete` del viaje cancelado NO dispara, y por eso el velo no cuelga de él',
)
/** 🔴 El historial: sin reponerlo, atrás se va del documento. */
afirmar(EFECTO_LIMPIO.includes("window.history.pushState(null, '', ancla)"), 'el historial se repone con `pushState`: sin eso, `preventDefault()` se come la entrada y atrás se va de la página')
afirmar(!/location\.hash|location\.href/.test(EFECTO_LIMPIO), '  y no por `location.hash`, que empuja historial pero además salta al instante')
/** El barrido de `.stop(` de `s18-compuertas` §3b tiene que CUBRIR este archivo. */
afirmar(
  !/\.stop\s*\(/.test(FUENTE_DEL_SPRINT),
  'nadie llama `stop()`: sin esa llamada no hay `lenis-stopped`, y sin la clase no hay `overflow: clip` que apague los tres `sticky`',
)
afirmar(
  leer('src/app/v3/_lib/__tests__/s18-compuertas.invariant.ts').includes(EFECTO),
  '  y el barrido de §3b LISTA este archivo: la garantía no quedó con un agujero del tamaño del sprint',
)
controlPositivo('el detector de `stop()` no está ciego', 'lenis.stop()', (f: string) => !/\.stop\s*\(/.test(f))

cerrar('s18-deslizamiento.invariant')
