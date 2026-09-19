/**
 * LA GLUE DEL BLOQUE ANIMADO — el ancla del pin y la especificación de pieza.
 *
 * ── Por qué es un módulo aparte (B4-A) ────────────────────────────────────
 *
 * Porque **sólo lo usa el árbol animado** —`coreografia-animada.tsx`, que entra
 * por el `import()` perezoso de la compuerta de 1025— y mientras vivió en
 * `motion.ts` viajaba en la carga inicial de `/v3`: ese módulo entra por
 * `CompuertaDelHome` (que le pide `deberiaAnimar`) y por `registro.ts` (que le
 * pide `USOS_DECLARADOS`), así que arrastraba todo lo demás. **503 B medidos
 * sobre el chunk de la página**, del lado equivocado de la compuerta.
 *
 * Ningún instrumento lo veía: `s7-compuerta` busca las huellas del SISTEMA de
 * motion (`_lib/motion/`) sobre el build, y esto es del CONTRATO — código
 * propio, escrito acá, que reproduce a mano lo que el sistema declara. La regla
 * que lo caza es la de siempre y ahora se puede escribir: **un módulo que sólo
 * consume el árbol animado no puede compartir archivo con uno que consume el
 * quieto.**
 */

import type { Ancla, ParDeAnclas } from '../../_lib/motion/anclas'
import type { Cronograma } from '../../_lib/motion/cronograma'
import type { EspecificacionDePieza } from '../../_lib/motion/fotograma'
import type { Patron } from '../../_lib/motion/patrones'

import { DESCANSO_ANTES_DE_SALIR_PX, ENTRADA_EN_CUADRO_PX } from './asentamiento'

/**
 * EL ANCLA DEL PIN — `top top` → `bottom bottom`. **[derivado], no medido.**
 *
 * Las nueve anclas de `ANCLAS` describen los patrones de la referencia. Ésta
 * describe otra cosa: **nuestra** geometría de pinneado, la que sale de
 * `secciones.ts` y de `position: sticky`.
 *
 * La cuenta, con la fórmula de `posicionDeAncla`:
 *
 *     inicio = topDoc + alto·0 + 0  −  (viewport·0 + 0)  =  topDoc
 *     fin    = topDoc + alto·1 + 0  −  (viewport·1 + 0)  =  topDoc + alto − viewport
 *     rango  = alto − viewport
 *
 * Y `alto − viewport` es exactamente el recorrido del pin: una sección de
 * 300svh con un hijo `sticky` de 100svh queda clavada 200svh. El progreso vale
 * 0 cuando el pin empieza y 1 cuando termina, que es lo que la secuencia
 * necesita para repartirse en tramos iguales.
 *
 * `s6-servicios.invariant` afirma esa igualdad y la controla con dos anclas
 * mutiladas que no la reproducen.
 */
const LADO_TOPE = { fraccion: 0, px: 0 } as const
const LADO_FONDO = { fraccion: 1, px: 0 } as const

const anclaDelPinInicio: Ancla = {
  declarado: 'top top',
  elemento: LADO_TOPE,
  viewport: LADO_TOPE,
}
const anclaDelPinFin: Ancla = {
  declarado: 'bottom bottom',
  elemento: LADO_FONDO,
  viewport: LADO_FONDO,
}

export const ANCLA_DEL_PIN: ParDeAnclas = { inicio: anclaDelPinInicio, fin: anclaDelPinFin }

/**
 * EL ANCLA DE LA VENTANA VISIBLE — **la regla de B9**, y es la segunda ancla
 * que este archivo escribe a mano por la misma razón que la primera.
 *
 * ── La regla, en una línea ────────────────────────────────────────────────
 *
 * > **El rango de una instancia se deriva de la ventana visible de SU caja:
 * > arranca cuando su borde superior está `ENTRADA_EN_CUADRO_PX` adentro del
 * > cuadro, y llega a su estado final cuando su borde inferior está a
 * > `DESCANSO_ANTES_DE_SALIR_PX` del borde de abajo.**
 *
 * La cuenta, con la fórmula de `posicionDeAncla`:
 *
 *     inicio = topDoc + alto·0 + 0  −  (viewport·1 − 80)   =  topDoc − viewport + 80
 *     fin    = topDoc + alto·1 + 0  −  (viewport·1 − 240)  =  topDoc + alto − viewport + 240
 *     rango  = alto + 160
 *
 * ── ⚠️ Y por qué NO se toca `ANCLAS` ni se rediseña un patrón ─────────────
 *
 * `ANCLAS` es la **medición de la referencia**: nueve pares leídos de su
 * `ScrollTrigger` y comprobados contra sus píxeles en `anclas.invariant.ts`.
 * Cambiar ahí sería reescribir lo que se midió del sitio ajeno. Lo que B9
 * cambia es **contra qué recorrido de scroll consume su patrón cada instancia
 * NUESTRA** — que es exactamente lo que un ancla hace, y lo que
 * `_contrato/asentamiento.ts` ya declaraba legítimo: *«no toca un solo valor de
 * un patrón… lo único que cambia es el RECORRIDO DE SCROLL sobre el que se
 * consumen»*. Claves, curva, duración y escalonado quedan intactos.
 *
 * ── ⚠️ Y el hallazgo, que es lo que hace que esto no sea un número nuevo ──
 *
 * **Este par ES `ANCLAS.P1`**, carácter por carácter. No se importa de ahí
 * —`s7-contrato` §3 prohíbe que un archivo de producto tome un valor de
 * `_lib/motion/`— sino que se escribe con las dos constantes que
 * `_contrato/asentamiento.ts` publica, y `s19-sincronia` afirma la igualdad
 * contra `ANCLAS.P1` con su control positivo. Es la misma costura de
 * `ANCLA_DEL_PIN` y de `CORTE_DE_TRAMOS`.
 *
 * Que la regla coincida con el ancla del patrón más usado de la referencia —142
 * de 244 instancias— no es una casualidad cómoda: **es el resultado.** La
 * referencia ancla su gesto dominante a la ventana visible del elemento, y las
 * 6 instancias nuestras que ya usaban P1 son las 6 que la medición de B9
 * encontró en regla. Aplicarles esta ancla es un no-op comprobable, y el
 * invariante lo comprueba.
 */
const anclaEnCuadroInicio: Ancla = {
  declarado: `top bottom-=${ENTRADA_EN_CUADRO_PX}px`,
  elemento: LADO_TOPE,
  viewport: { fraccion: 1, px: -ENTRADA_EN_CUADRO_PX },
}
const anclaEnCuadroFin: Ancla = {
  declarado: `bottom bottom-=${DESCANSO_ANTES_DE_SALIR_PX}px`,
  elemento: LADO_FONDO,
  viewport: { fraccion: 1, px: -DESCANSO_ANTES_DE_SALIR_PX },
}

export const ANCLA_DE_LA_VENTANA_VISIBLE: ParDeAnclas = {
  inicio: anclaEnCuadroInicio,
  fin: anclaEnCuadroFin,
}

/**
 * EL ANCLA DEL TRAZO — `top 95%` → `top 35%`, la ventana en la que un trazo se
 * dibuja. Modo pulido: la misma ventana corrida entera hacia arriba. Con
 * `75% → 10%` el último tramo caía con el titular saliendo por arriba —se
 * dibujaba donde nadie lo mira—; arrancando al 95% empieza apenas el titular
 * entra por abajo y termina con él todavía en la mitad de arriba del cuadro.
 */
const anclaDelTrazoInicio: Ancla = {
  declarado: 'top 95%',
  elemento: LADO_TOPE,
  viewport: { fraccion: 0.95, px: 0 },
}
const anclaDelTrazoFin: Ancla = {
  declarado: 'top 35%',
  elemento: LADO_TOPE,
  viewport: { fraccion: 0.35, px: 0 },
}

export const ANCLA_DEL_TRAZO: ParDeAnclas = { inicio: anclaDelTrazoInicio, fin: anclaDelTrazoFin }

/** La ventana que estrenó el trazo —`top 80%` → `top 45%`— y que las máscaras de renglón siguen usando: al trazo se le amplió y a ellas no. */
export const ANCLA_DE_LA_MASCARA: ParDeAnclas = {
  inicio: { declarado: 'top 80%', elemento: LADO_TOPE, viewport: { fraccion: 0.8, px: 0 } },
  fin: { declarado: 'top 45%', elemento: LADO_TOPE, viewport: { fraccion: 0.45, px: 0 } },
}

/**
 * La llegada de una foto: empieza cuando su borde superior entra por abajo del
 * cuadro y termina cuando ESE MISMO borde llega al 55% del alto.
 *
 * Modo pulido: el fin era `center 55%`, que le sumaba media altura de la pieza
 * al recorrido (259 px en un retrato a 1920). Con el borde superior el rango es
 * sólo `0,45 · viewport` y no depende del alto: entra en dos scrolls, que es lo
 * que hace falta para que el resorte de `ProgresoAmortiguado` se note.
 */
export const ANCLA_DE_LA_LLEGADA: ParDeAnclas = {
  inicio: { declarado: 'top bottom', elemento: LADO_TOPE, viewport: LADO_FONDO },
  fin: { declarado: 'top 55%', elemento: LADO_TOPE, viewport: { fraccion: 0.55, px: 0 } },
}

/**
 * EL RESORTE CON EL QUE UNA PIEZA PERSIGUE AL SCROLL.
 *
 * El scroll mueve un OBJETIVO y la pieza lo persigue: al soltar, sigue viajando
 * y recién ahí se asienta. `duration` es el tiempo de asentamiento —0,5 s, el
 * medio de los 0,4–0,6 pedidos— y `bounce: 0` lo deja críticamente amortiguado:
 * llega y para, no se pasa y vuelve.
 */
export const PERSECUCION_DEL_SCROLL = { duration: 0.5, bounce: 0 } as const

/**
 * Dónde se parte la ventana del trazo. Los dos tramos van SECUENCIALES y no
 * superpuestos: el subrayado ocupa la primera mitad y llega a 1 justo cuando el
 * tachado arranca. Primero se afirma lo que hacemos y recién después se tacha lo otro.
 */
export const CORTE_DE_LA_VENTANA_DEL_TRAZO = 0.5

/** Cuánto se atrasa la barra de abajo del signo respecto de la de arriba, en fracción de la primera mitad. «Apenas antes», no una escalera. */
export const DESFASE_DE_LAS_BARRAS = 0.15

/**
 * DE DÓNDE LLEGA UNA FOTO, Y CÓMO. [medido sobre el video de la referencia]
 *
 * Arranca lejos —abajo y al costado de su lugar, mucho más chica y bien torcida— y
 * viaja hasta quedar exactamente donde va. **La curva no se declara: SALE de usar dos
 * curvas del sistema DISTINTAS para las dos coordenadas.** Con la misma en las dos el
 * recorrido sería una recta diagonal; la diferencia entre una y otra ES la curvatura, y
 * por eso no hace falta inventar ninguna curva nueva para tener un camino curvo.
 *
 * ⚠️ Los cuatro valores subieron fuerte: con los anteriores —40/80 px, 0,8 y 7°— la
 * foto llegaba casi puesta y sólo se reacomodaba; el viaje no se leía al 100 % de zoom.
 * El desplazamiento dejó de derivarse de `ENTRADA_EN_CUADRO_PX` porque ya no es un
 * umbral de entrada: es la distancia del viaje, y se pidió medida.
 *
 * `x` y `giro` llevan SIGNO: cada persona entra desde su lado —el que le deja libre su
 * mitad de la fila— y el giro acompaña a la dirección en vez de cruzarla.
 */
export const LLEGADA_EN_CURVA = {
  x: 140,
  y: 280,
  escala: 0.6,
  giro: 12,
} as const

/** Desde qué lado entra una foto. El signo lo aplica la primitiva a `x` y a `giro`. */
export type SentidoDeLlegada = 'desde-la-izquierda' | 'desde-la-derecha'

/**
 * El cronograma de un patrón con N piezas, en sus valores medidos.
 *
 * La duración APLICADA no es ésta: es `duracionDeclarada + escalonado·(N−1)`, y
 * la calcula `duracionAplicada` del sistema. Acá se declara lo declarado.
 */
export function cronogramaDe(patron: Patron, cantidad: number): Cronograma {
  return {
    duracionDeclarada: patron.duracionDeclarada,
    escalonado: patron.escalonado,
    cantidad,
  }
}

/** La especificación de pieza lista para `Pieza`, `Piezas` y `propiedadesDePieza`. */
export function especificacionDe(patron: Patron, cantidad: number): EspecificacionDePieza {
  return {
    claves: patron.claves,
    tramos: patron.tramos,
    pointerEvents: patron.pointerEvents,
    curva: patron.curva,
    cronograma: cronogramaDe(patron, cantidad),
  }
}

/**
 * La inercia del `scrub`, en segundos, o `null` si el patrón no declara una.
 *
 * `scrub: true` en la referencia significa "sin inercia": el cabezal sigue al
 * scroll sin retraso. Un número son los segundos que tarda en alcanzarlo, y el
 * sistema lo reproduce con un resorte sin rebote — misma familia de
 * comportamiento, no la misma matemática. Está declarado así en S2.
 */
export function inerciaDe(patron: Patron): number | null {
  return typeof patron.scrub === 'number' ? patron.scrub : null
}
