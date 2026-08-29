/**
 * INVARIANTE — las anclas, contra los píxeles medidos de la referencia.
 *
 * Corre con `npm run test:s2-anclas`.
 *
 * ── Por qué esto se puede comprobar de verdad ──────────────────────────────
 *
 * SCROLL.md §2 publica los `start` y `end` en PÍXELES ABSOLUTOS de scroll de las
 * 60 instancias de la home a 1440, leídos del objeto vivo después de
 * `refresh()`. El viewport de esa medición son 900 px.
 *
 * Nuestra función de anclas es pura: `(topDoc, alto, viewport) → (inicio, fin)`.
 * Así que se le puede pedir que reproduzca esos píxeles. Si la traducción de la
 * gramática de ScrollTrigger estuviera mal —un `−240` olvidado, un borde
 * cambiado— los números no cerrarían.
 *
 * ── El caso que se usa, y por qué ese ───────────────────────────────────────
 *
 * Las instancias 44 a 59 de la home: dieciséis, todas con el MISMO rango de 190
 * px, con 30 px de desfase entre una y la siguiente. SCROLL.md las describe como
 * "la lista de links del pie, revelada ítem por ítem con 30px de desfase". Son
 * `span` dentro de `li`, que es el tipo de elemento dominante de P1 (67 de sus
 * 142 targets son `span`).
 *
 * Con el ancla de P1 —`top bottom-=80px` → `bottom bottom-=240px`— un elemento de
 * 30 px de alto da un rango de exactamente 190. Los 16 rangos medidos son 190.
 *
 * ⚠ Que esas 16 instancias SEAN P1 es una inferencia, no está escrito en
 * SCROLL.md. Lo que el invariante afirma sin inferencia es más débil y más útil:
 * que si son P1, nuestra función reproduce sus píxeles EXACTOS, y que una
 * traducción con un solo término mal no los reproduce.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import {
  ANCLAS,
  RANGO_MINIMO_PX,
  acotar01,
  posicionDeAncla,
  progresoEnRango,
  rangoDegenerado,
  rangoDeScroll,
  type Ancla,
  type CajaMedida,
} from '../anclas'
import { ORDEN_DE_PATRONES, PATRONES } from '../patrones'

/** El viewport de la medición de la referencia. */
const VIEWPORT = 900

/** Los 16 `start` del bloque de links del pie de la home (SCROLL.md §2). */
const INICIOS_DEL_PIE = [
  19839, 19839, 19839, 19839, 19869, 19869, 19869, 19899, 19899, 19929, 19929, 19959, 19959,
  19989, 20019,
]
/** Todos terminan 190 px después del suyo. El primero, en 20029. */
const FIN_DEL_PRIMERO = 20029
const ALTO_DEL_ITEM = 30

// ═══════════════════════════════════════════════════════════════════════════
titulo('A1 · El bloque del pie de la home, píxel por píxel')

// De `start = topDoc − viewport + 80` se despeja el topDoc del primer ítem.
const topDocDelPrimero = INICIOS_DEL_PIE[0] + VIEWPORT - 80
const caja: CajaMedida = { topDoc: topDocDelPrimero, alto: ALTO_DEL_ITEM }
const rango = rangoDeScroll(ANCLAS.P1, caja, VIEWPORT)

afirmarIgual(rango.inicio, 19839, 'el `start` reproduce el medido')
afirmarIgual(rango.fin, FIN_DEL_PRIMERO, 'y el `end` también — 190 px de recorrido')
afirmarIgual(rango.fin - rango.inicio, 190, 'el rango es alto + 160, que para 30 px de alto son 190')

// Los desfases: cada ítem está 30 px más abajo y su rango se corre 30 px.
const desfases = [...new Set(INICIOS_DEL_PIE)].sort((a, b) => a - b)
let todosReproducen = true
for (let i = 0; i < desfases.length; i++) {
  const r = rangoDeScroll(
    ANCLAS.P1,
    { topDoc: topDocDelPrimero + i * ALTO_DEL_ITEM, alto: ALTO_DEL_ITEM },
    VIEWPORT,
  )
  if (r.inicio !== desfases[i]) todosReproducen = false
}
afirmarIgual(desfases.length, 7, 'hay siete posiciones distintas entre las dieciséis instancias')
afirmar(
  todosReproducen,
  'y las siete se reproducen moviendo el elemento 30 px por vez',
  desfases.join(' · '),
)

controlPositivo(
  'un ancla SIN el −240px del final no reproduce el `end` medido',
  {
    declarado: 'bottom bottom (sin el −240)',
    elemento: { fraccion: 1, px: 0 },
    viewport: { fraccion: 1, px: 0 },
  } satisfies Ancla,
  (anclaMala) => posicionDeAncla(anclaMala, caja, VIEWPORT) === FIN_DEL_PRIMERO,
)

controlPositivo(
  'un ancla SIN el −80px del inicio tampoco reproduce el `start`',
  {
    declarado: 'top bottom (sin el −80)',
    elemento: { fraccion: 0, px: 0 },
    viewport: { fraccion: 1, px: 0 },
  } satisfies Ancla,
  (anclaMala) => posicionDeAncla(anclaMala, caja, VIEWPORT) === 19839,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A2 · El tramo largo del pie — consistente con el ancla de P2')

/**
 * La instancia 37 de la home (`footer > div[0]`) va de 17.612 a 18.512: 900 px
 * exactos, una pantalla. El ancla de P2 —`top bottom` → `bottom bottom`— da un
 * rango igual al alto del elemento, así que reproducirla pide un elemento de
 * exactamente un viewport de alto.
 *
 * ⚠ Es una comprobación de CONSISTENCIA, no una identificación: SCROLL.md no
 * dice qué patrón es esa instancia. Lo que se afirma es que el ancla de P2, tal
 * como la escribimos, produce ese rango con esa caja.
 */
const rangoP2 = rangoDeScroll(
  ANCLAS.P2,
  { topDoc: 17612 + VIEWPORT, alto: VIEWPORT },
  VIEWPORT,
)
afirmarIgual(rangoP2.inicio, 17612, 'el `start` de la instancia 37 se reproduce')
afirmarIgual(rangoP2.fin, 18512, 'y el `end` también: una pantalla exacta')
afirmarIgual(rangoP2.fin - rangoP2.inicio, VIEWPORT, 'el rango de P2 es el alto del elemento, sin más')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A3 · La forma del rango de los nueve — rango = alto + k·viewport + c')

/**
 * El elemento de sondeo es ALTO a propósito (3000 px). Con uno bajo, el ancla de
 * P5 degenera y el acotado a `RANGO_MINIMO_PX` distorsiona el despeje: la
 * primera versión de este bloque imprimió "alto + 0·viewport − 99 px" para P5,
 * que no es su fórmula sino el acotado leyéndose como si lo fuera. Un
 * instrumento que mide el acotado en vez del ancla es un instrumento roto,
 * aunque todas sus afirmaciones den verde.
 */
const ALTO_DE_SONDEO = 3000
for (const id of ORDEN_DE_PATRONES) {
  const par = PATRONES[id].anclas
  // Dos viewports distintos despejan k y c sin álgebra simbólica.
  const r1 = rangoDeScroll(par, { topDoc: 5000, alto: ALTO_DE_SONDEO }, 1000)
  const r2 = rangoDeScroll(par, { topDoc: 5000, alto: ALTO_DE_SONDEO }, 2000)
  const k = (r2.fin - r2.inicio - (r1.fin - r1.inicio)) / 1000
  const c = r1.fin - r1.inicio - ALTO_DE_SONDEO - k * 1000
  const rCrudo = rangoDeScroll(par, { topDoc: 5000, alto: 1000 }, 1000)
  console.log(
    `  ${id}  rango = alto ${k >= 0 ? '+' : '−'} ${Math.abs(k)}·viewport ${c >= 0 ? '+' : '−'} ${Math.abs(c)} px   ·  ${par.inicio.declarado} → ${par.fin.declarado}`,
  )
  afirmar(
    rCrudo.fin > rCrudo.inicio,
    `  ${id} da un rango positivo con un elemento de 1000 px y un viewport de 1000`,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('A4 · P5 es el único que puede degenerar, y está acotado')

const cajaBaja: CajaMedida = { topDoc: 4000, alto: 100 }
afirmar(
  rangoDegenerado(ANCLAS.P5, cajaBaja, 1000),
  'con un elemento de 100 px y un viewport de 1000, el ancla de P5 da rango negativo',
)
const acotado = rangoDeScroll(ANCLAS.P5, cajaBaja, 1000)
afirmarIgual(
  acotado.fin - acotado.inicio,
  RANGO_MINIMO_PX,
  '  y el rango se acota al mínimo en vez de dividir por cero',
)
let algunOtroDegenera = false
for (const id of ORDEN_DE_PATRONES) {
  if (id === 'P5') continue
  if (rangoDegenerado(PATRONES[id].anclas, cajaBaja, 1000)) algunOtroDegenera = true
}
afirmar(!algunOtroDegenera, 'y ninguno de los otros ocho degenera con la misma caja')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A5 · El progreso: acotado, lineal y exactamente reversible')

const r = { inicio: 1000, fin: 2000 }
afirmarIgual(progresoEnRango(999, r), 0, 'antes del rango, 0')
afirmarIgual(progresoEnRango(1000, r), 0, 'en el borde de arranque, 0')
afirmarIgual(progresoEnRango(1500, r), 0.5, 'en la mitad, 0,5')
afirmarIgual(progresoEnRango(2000, r), 1, 'en el borde final, 1')
afirmarIgual(progresoEnRango(999999, r), 1, 'después del rango, 1 — y no crece')

let reversible = true
for (let y = 900; y <= 2100; y += 7) {
  if (progresoEnRango(y, r) !== progresoEnRango(y, r)) reversible = false
}
afirmar(reversible, 'y el valor depende SOLO de la posición: subir y bajar da lo mismo')

afirmarIgual(acotar01(-3), 0, 'acotar01 corta por abajo')
afirmarIgual(acotar01(3), 1, 'y por arriba')

controlPositivo(
  'el chequeo de acotado ve una función que NO acota',
  (y: number) => (y - r.inicio) / (r.fin - r.inicio),
  (sinAcotar) => sinAcotar(999999) <= 1,
)

cerrar('anclas.invariant')
