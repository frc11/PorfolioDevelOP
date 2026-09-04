/**
 * INVARIANTE — EL RITMO DEL HOME ENTERO: pantallas y momentos de las OCHO.
 *
 * Corre con `npm run test:s7-ritmo`.
 *
 * ── Por qué esta cifra es la primera que se puede comparar ────────────────
 *
 * Los dos lanes publicaron la suya y las dos eran parciales por construcción:
 * cuatro secciones contra las OCHO de la home de la referencia. Comparar 5
 * momentos contra 20,5 no dice nada. **Ésta es la primera vez que el número es
 * comparable**, y por eso está acá y no en ninguno de los dos.
 *
 * ── Y la cuenta cambió de definición, que no es un ajuste ─────────────────
 *
 * Los dos lanes entendieron distinto qué son las "pantallas pinneadas" —la
 * sección entera contra el recorrido del pin— y ganó la del lane B porque es la
 * que la referencia midió (`rangoPegado = alto del contenedor − alto del
 * elemento pegado`, SCROLL.md §4). El porqué entero está en `_contrato/ritmo.ts`.
 *
 * ⚠ Lo que este archivo agrega sobre esa decisión: **la constante que la cuenta
 * usa se verifica contra el marcado**. `PANTALLAS_DEL_STICKY = 1` sólo es cierto
 * mientras el hijo pegado mida una pantalla, y eso lo decide una clase que se
 * puede cambiar sin que nada falle. Acá se lee del HTML.
 */

import { REGISTRO } from '../../_secciones/_contrato/registro'
import { pantallasDe } from '../../_secciones/_contrato/forma'
import {
  PANTALLAS_DEL_STICKY,
  RITMO_DE_LA_REFERENCIA,
  compresionDe,
  momentosDe,
  ritmoDe,
} from '../../_secciones/_contrato/ritmo'
import { marcar } from '../../_secciones/_invariantes/render'
import { SECCIONES } from '../secciones'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La fórmula reproduce el número de la referencia')

const { pantallas: pRef, pantallasPinneadas: pinRef, secuencias: secRef, momentos: momRef } =
  RITMO_DE_LA_REFERENCIA

afirmarIgual(
  momentosDe(pRef, pinRef, secRef),
  momRef,
  `momentos = pantallas − pinneadas + secuencias reproduce los ${momRef} de la home medida (${pRef} − ${pinRef} + ${secRef})`,
)

controlPositivo(
  'la fórmula NO es la identidad: sin pinneo el número cambia',
  { pantallas: pRef, pinneadas: 0, secuencias: 0 },
  (c: { pantallas: number; pinneadas: number; secuencias: number }) =>
    momentosDe(c.pantallas, c.pinneadas, c.secuencias) === momRef,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La constante del pin se verifica contra el MARCADO, no se cree')

/**
 * `PANTALLAS_DEL_STICKY = 1` es lo que hace que la cuenta signifique lo que
 * dice. Si mañana alguien cambiara la clase del hijo pegado, la constante
 * seguiría diciendo 1 y la cuenta mentiría sin que nada fallara. Por eso se lee
 * la clase que el envoltorio emite de verdad.
 */
const pinneadas = REGISTRO.filter((m) => m.seccion.pinneada !== undefined)
afirmar(pinneadas.length > 0, `hay ${pinneadas.length} secciones pinneadas que verificar`)

/**
 * ⚠️ **SE LEE LA CLASE DEL ELEMENTO PEGADO, NO UNA SUBCADENA DEL DOCUMENTO
 * (SITIO-S11), y la clase de `siempre` cambió.**
 *
 * Esta comprobación buscaba `'h-svh'` con `html.includes(...)`. **Era verde por
 * subcadena**: `min-h-svh` la contiene, así que el día que el envoltorio pasara
 * de una a la otra la línea habría seguido en verde diciendo algo falso. S11
 * hizo exactamente ese cambio —`pinneada: 'siempre'` pasa de `h-svh` a
 * `min-h-svh`, que es lo que arregla el defecto 1 de §7.38— así que la
 * comprobación se rehace leyendo las clases DEL elemento que lleva
 * `data-pinneado` y comparando por token exacto.
 *
 * Y lo que se afirma es lo que la cuenta necesita: que el hijo pegado declare
 * UNA pantalla. En `desde-escritorio` la declara como alto FIJO
 * (`escritorio:h-svh`); en `siempre`, como PISO (`min-h-svh`). El piso es lo
 * que hace que una sección cuyo contenido quieto mide tres pantallas deje de
 * esconder dos, y no cambia la cuenta de escritorio, que es la que este archivo
 * produce.
 */
const clasesDelPegado = (html: string, modo: string): string[] =>
  (new RegExp(`data-pinneado="${modo}"\\s+class="([^"]*)"`).exec(html)?.[1] ?? '').split(/\s+/)

for (const m of pinneadas) {
  const html = marcar(<m.Componente seccion={m.seccion} />, { anima: false })
  const clase = m.seccion.pinneada === 'siempre' ? 'min-h-svh' : 'escritorio:h-svh'
  afirmar(
    clasesDelPegado(html, m.seccion.pinneada ?? '').includes(clase),
    `\`${m.id}\` — el hijo pegado declara ${PANTALLAS_DEL_STICKY} pantalla (\`${clase}\`)`,
  )
}
afirmarIgual(PANTALLAS_DEL_STICKY, 1, 'y la constante de la cuenta dice lo mismo')

controlPositivo(
  'el lector de la clase del sticky ve un alto que no es una pantalla',
  '<div data-pinneado="siempre" class="sticky top-0 h-[50svh]">',
  (html: string) => clasesDelPegado(html, 'siempre').includes('min-h-svh'),
)
controlPositivo(
  '  y no se lo cree por subcadena: `min-h-svh` NO satisface a `h-svh`',
  '<div data-pinneado="desde-escritorio" class="escritorio:sticky escritorio:min-h-svh">',
  (html: string) => clasesDelPegado(html, 'desde-escritorio').includes('escritorio:h-svh'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Las ocho, una por una')

for (const s of SECCIONES) {
  const fila = ritmoDe([s])
  console.log(
    `  ${s.numero} ${s.id.padEnd(18)} ${s.alto.padEnd(7)} → ${fila.pantallas.toFixed(1)} pantallas · ` +
      `${fila.pantallasPinneadas.toFixed(1)} pinneadas · ${fila.momentos.toFixed(1)} momentos` +
      (s.pinneada === undefined ? '' : `   [${s.pinneada}]`),
  )
}

afirmarIgual(
  SECCIONES.map((s) => pantallasDe(s)),
  [1, 3, 4, 3, 3, 2, 1, 1],
  'cada sección ocupa lo que la tabla declara, con las DOS subidas que B2 derivó del techo de velocidad',
)

controlPositivo(
  'el comparador ve un alto cambiado',
  SECCIONES.map((s) => (s.id === 'numeros' ? 2 : pantallasDe(s))),
  (lista: number[]) => JSON.stringify(lista) === JSON.stringify(SECCIONES.map((s) => pantallasDe(s))),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · EL RITMO DEL HOME — la cifra comparable')

const ritmo = ritmoDe(SECCIONES)

console.log(
  `  LAS OCHO: ${ritmo.pantallas.toFixed(1)} pantallas nominales · ${ritmo.pantallasPinneadas.toFixed(1)} pinneadas · ` +
    `${ritmo.secuencias} secuencias → ${ritmo.momentos.toFixed(1)} MOMENTOS REALES`,
)
console.log(
  `  LA REFERENCIA (${RITMO_DE_LA_REFERENCIA.fuente}): ${pRef} pantallas · ${pinRef} pinneadas · ` +
    `${secRef} secuencias → ${momRef} momentos`,
)
console.log(
  `  compresión: ${compresionDe(ritmo)} momentos por pantalla, contra ${compresionDe({
    pantallas: pRef,
    pantallasPinneadas: pinRef,
    secuencias: secRef,
    momentos: momRef,
  })} de la referencia.`,
)
console.log(
  `  o sea: el home se lee como ${ritmo.momentos.toFixed(1)} cosas en ${ritmo.pantallas.toFixed(1)} pantallas de scroll.`,
)
console.log('  ⚠️ Es el ritmo de ESCRITORIO. Abajo de 1025 Trabajos no se pinnea y el número es otro.')

afirmar(ritmo.pantallas > 0 && ritmo.momentos > 0, 'el ritmo no es cero: el derivador miró algo')
afirmarIgual(ritmo.secuencias, 2, 'DOS secuencias pinneadas, como la home de la referencia')
afirmar(
  compresionDe(ritmo) < 1,
  'el home comprime: hay menos momentos que pantallas, que es lo que aporta el pinneo',
  `${compresionDe(ritmo)} < 1`,
)

controlPositivo(
  'la compresión NO se cumple sola: un recorrido sin pinneo no comprime',
  ritmoDe(SECCIONES.map((s) => ({ ...s, pinneada: undefined }))),
  (r) => compresionDe(r) < 1,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El ritmo de ABAJO de 1025 — publicado, porque es otro número')

/**
 * Abajo del umbral `desde-escritorio` no pinnea, así que Trabajos deja de ser
 * una secuencia y sus tres pantallas se leen como tres. Es exactamente lo que
 * SCROLL.md publica por separado para 390, y por la misma razón: **no es la
 * misma experiencia**, y promediar las dos no describe ninguna.
 */
const abajoDelUmbral = SECCIONES.map((s) =>
  s.pinneada === 'desde-escritorio' ? { ...s, pinneada: undefined } : s,
)
const ritmoAbajo = ritmoDe(abajoDelUmbral)
console.log(
  `  ABAJO DE 1025: ${ritmoAbajo.pantallas.toFixed(1)} pantallas · ${ritmoAbajo.pantallasPinneadas.toFixed(1)} pinneadas · ` +
    `${ritmoAbajo.secuencias} secuencia → ${ritmoAbajo.momentos.toFixed(1)} momentos`,
)
console.log(
  `  la referencia a 390: 21,90 pantallas → 21,2 momentos (SCROLL.md §6). Casi no le queda pinneo, igual que acá.`,
)
afirmar(
  ritmoAbajo.momentos > ritmo.momentos,
  'abajo del umbral hay MÁS momentos: el pin que se apaga deja de comprimir',
  `${ritmoAbajo.momentos.toFixed(1)} contra ${ritmo.momentos.toFixed(1)}`,
)
afirmarIgual(ritmoAbajo.pantallas, ritmo.pantallas, '  y las mismas pantallas: el documento no cambia de alto')

cerrar('s7-ritmo.invariant')
