/**
 * INVARIANTE — LAS DOS COMPENSACIONES DE LA FAMILIA, MEDIDAS, Y POR QUÉ EL
 * TEMA SIGUE SIN APLICAR NINGUNA.
 *
 * Corre con `npm run test:s16-tipografia`.
 *
 * ── Qué frente cierra ─────────────────────────────────────────────────────
 *
 * *«El texto se ve muy chico a comparación de la página que quiero imitar.»*
 * V3-C refutó la primera causa —la referencia topa en 1440 igual que nosotros,
 * medido sobre 24 volcados— y dejó UNA sola en pie: la cap height de Chivo es
 * 4,72% más chica que la de Instrument Sans. Este invariante la mide hasta el
 * fondo y **publica el resultado, que es que compensarla no mejora el total**.
 *
 * ── Las ocho afirmaciones ─────────────────────────────────────────────────
 *
 *   1. Las dos compensaciones salen del BINARIO, no de una cita.
 *   2. El tema de HOY no aplica ninguna de las dos: los 14 valores están sin
 *      tocar, y eso se comprueba contra la hoja, no se supone.
 *   3. Los 14 valores bajo cada factor: la de x mueve 0 —reproduce
 *      `REPORTE-S0.md` §(b) con el instrumento— y la de cap mueve 12.
 *   4. La escala compensada en los cuatro anchos: ninguna de las tres
 *      hipótesis colisiona un par. **La objeción geométrica NO ata.**
 *   5. LA PARADA: cuánto se mueven 375 y 1440, contra la vara con la que esas
 *      dos anclas fueron aceptadas.
 *   6. Dónde manda cada métrica, MEDIDO sobre el documento — y no es donde la
 *      premisa decía.
 *   7. De qué familia salieron los 14 valores, leído de los documentos.
 *   8. El empate que ningún número del repo rompe, y por eso este frente frena.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ANCHOS_DE_LA_BANDA, escalaA, separacionesEn } from './s3-banda'
import type { NivelResuelto } from './s10-mobile'
import { afirmarDondeManda, afirmarElEmpate, afirmarLaProcedencia } from './s16-afirmaciones'
import {
  CHIVO_MEDIDO,
  COMPENSACIONES,
  COMPENSACION_DE_CAP,
  COMPENSACION_DE_X,
  ALCANCE_DE_LA_COMPENSACION,
  TODOS_LOS_NIVELES,
  NINGUNO,
  NIVELES_DE_DISPLAY,
  type Alcance,
  desplazamientoMaximo,
  escalaCompensadaA,
  valoresDeclarados,
  valoresQueSeMueven,
} from './s16-compensacion'
import { LAYOUT_DE_S0, criterioDeAceptacion } from './s16-lectura'
import { NIVELES_TIPOGRAFICOS } from '../tipografia'
import { FUENTE_DISPLAY } from './s10-avance'
import { leerMetricas } from './s3-woff2'
import { TIPOGRAFIA_DEL_TITULAR } from '../../_secciones/hero/geometria'

const ANCHOS = ANCHOS_DE_LA_BANDA.map((a) => a.px)
const CAP = COMPENSACION_DE_CAP.factor
const X = COMPENSACION_DE_X.factor

/** Las tres hipótesis que este frente evalúa. `hoy` es la que el tema aplica. */
const HIPOTESIS: readonly { nombre: string; factor: number; alcance: Alcance }[] = [
  { nombre: 'hoy         ', factor: 1, alcance: NINGUNO },
  { nombre: 'cap·display ', factor: CAP, alcance: ALCANCE_DE_LA_COMPENSACION },
  { nombre: 'cap·todos   ', factor: CAP, alcance: TODOS_LOS_NIVELES },
  { nombre: 'x·todos     ', factor: X, alcance: TODOS_LOS_NIVELES },
]

/**
 * ⚠️ EL ALCANCE DE `cap·display` DEJÓ DE SER `NIVELES_DE_DISPLAY`, Y LO FORZÓ
 * EL NOVENO NIVEL. Con `display` afuera del alcance, el factor sube
 * `titulo-xl` de 56 a 58,78 px y deja `display` en 58: la escala se DA VUELTA
 * en los cuatro anchos. Eso no es una propiedad de la compensación, es un
 * alcance que se quedó viejo, y una hipótesis que nadie aplicaría así no se
 * puede evaluar. El porqué de separar «lo que §2.1 midió» de «lo que la
 * compensación tocaría» está en `s16-compensacion.ts`.
 */

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Las dos compensaciones, derivadas del binario que /v3 sirve')

afirmarIgual(CHIVO_MEDIDO.unidadesPorEm, 1000, 'el em de Chivo mide 1000 unidades, leído de `head`')
for (const c of COMPENSACIONES) {
  console.log(
    `  ${c.metrica.padEnd(10)} Chivo ${c.deChivo} · Instrument Sans ${c.deInstrumentSans}  →  ` +
      `desvío ${c.desvio.toFixed(4)} %  ·  factor de compensación ${c.factor.toFixed(6)}`,
  )
}
afirmar(
  Math.abs(COMPENSACION_DE_CAP.factor - 1.049563) < 1e-6,
  'la compensación de CAP HEIGHT es 720/686',
  `${COMPENSACION_DE_CAP.factor.toFixed(6)} — la métrica que NO transfiere`,
)
afirmar(
  Math.abs(COMPENSACION_DE_X.factor - 0.998043) < 1e-6,
  'la compensación de X-HEIGHT es 510/511',
  `${COMPENSACION_DE_X.factor.toFixed(6)} — adentro de la banda 0,98–1,02 de B6.5b`,
)
controlPositivo(
  'el derivador no inventa una compensación donde las dos métricas coinciden',
  { chivo: 686, otra: 686 },
  (par: { chivo: number; otra: number }) => Math.abs(par.otra / par.chivo - 1) > 1e-9,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El tema de HOY no aplica ninguna de las dos')

const DECLARADOS = valoresDeclarados()
afirmarIgual(DECLARADOS.length, 18, 'son 18 los valores que una compensación tocaría: 10 tokens + 8 pisos — eran 14 (8 + 6) antes de los dos niveles del titular')
console.log(`  ${DECLARADOS.map((v) => `${v.donde.replace('--text-', '')} ${v.px}`).join(' · ')}`)
afirmarIgual(
  DECLARADOS.filter((v) => !Number.isInteger(v.px)).map((v) => v.donde),
  [],
  'los 18 son ENTEROS en la hoja: ningún factor de familia se aplicó nunca a esta escala',
)
controlPositivo(
  'el detector de una escala ya compensada la ve: con el factor de la cap ninguno queda entero',
  CAP,
  (f: number) => DECLARADOS.every((v) => Number.isInteger(v.px * f)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los 18 valores bajo cada factor — 0 de 18 contra 16 de 18')

for (const [etiqueta, f] of [['x  ', X], ['cap', CAP]] as const) {
  const mueve = valoresQueSeMueven(f)
  console.log(
    `  ${etiqueta}  mueve ${mueve.length} de ${DECLARADOS.length} al redondear · ` +
      `desplazamiento máximo ${desplazamientoMaximo(f).toFixed(4)} px` +
      (mueve.length === 0 ? '' : `\n       [${mueve.map((m) => `${m.donde.replace('--text-', '')} ${m.de}→${m.a}`).join(' · ')}]`),
  )
}
afirmarIgual(
  valoresQueSeMueven(X).length,
  0,
  '⚠️ la compensación de X MUEVE 0 DE 18: el instrumento reproduce `REPORTE-S0.md` §(b), que era una cita — y los dos niveles del titular no la movieron',
)
afirmar(
  desplazamientoMaximo(X) < 0.25,
  '  y su desplazamiento máximo sigue siendo una fracción de píxel: es una no-operación, no una decisión',
  `${desplazamientoMaximo(X).toFixed(4)} px sobre --text-display-xl, que pasó a ser el valor más grande de la tabla (era 0,1096 sobre --text-titulo-xl y 0,1135 sobre --text-display)`,
)
afirmarIgual(
  valoresQueSeMueven(CAP).length,
  16,
  '⚠️ la compensación de CAP mueve 16 de 18 — siguen siendo `micro` y su piso los ÚNICOS dos que aguantan el redondeo',
)
controlPositivo(
  'el contador de valores movidos no está clavado en cero',
  CAP,
  (f: number) => valoresQueSeMueven(f).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Los diez niveles en los cuatro anchos, bajo las cuatro hipótesis')

for (const h of HIPOTESIS) {
  for (const ancho of ANCHOS) {
    const escala = escalaCompensadaA(ancho, h.factor, h.alcance)
    const sep = separacionesEn(escala)
    console.log(
      `  ${h.nombre} @${String(ancho).padStart(4)}  ${escala.map((n) => n.px.toFixed(3)).join(' ')}` +
        `  ||  sep ${sep.map((s) => s.px.toFixed(3)).join(' ')}  ||  mínima ${Math.min(...sep.map((s) => s.px)).toFixed(4)}`,
    )
  }
}
const colisiones = HIPOTESIS.flatMap((h) =>
  ANCHOS.flatMap((ancho) =>
    separacionesEn(escalaCompensadaA(ancho, h.factor, h.alcance))
      .filter((s) => s.px <= 0)
      .map((s) => `${h.nombre.trim()} @${ancho} ${s.de}→${s.a}`),
  ),
)
afirmarIgual(
  colisiones,
  [],
  '⚠️ NINGUNA de las tres compensaciones colisiona un par en ninguno de los cuatro anchos: la objeción geométrica NO ata',
)
const minimaDe = (h: { factor: number; alcance: Alcance }): number =>
  Math.min(...ANCHOS.map((a) => Math.min(...separacionesEn(escalaCompensadaA(a, h.factor, h.alcance)).map((s) => s.px))))
const minimaHoy = Math.min(...ANCHOS.map((a) => Math.min(...separacionesEn(escalaA(a)).map((s) => s.px))))
const aprietan = HIPOTESIS.filter((h) => minimaDe(h) < minimaHoy - 1e-9).map((h) => h.nombre.trim())
afirmarIgual(
  aprietan,
  ['x·todos'],
  `sólo la de X aprieta la escala por debajo de lo que ya estaba (${minimaHoy.toFixed(4)} px), y por ` +
    `${Math.max(...HIPOTESIS.map((h) => minimaHoy - minimaDe(h))).toFixed(4)} px: las de CAP la ABREN`,
)
controlPositivo(
  'el detector de colisiones ve un par dado vuelta',
  [{ nivel: 'base', px: 20 }, { nivel: 'titulo-s', px: 17 }],
  (escala) => separacionesEn(escala as NivelResuelto[]).filter((s) => s.px <= 0).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · LA PARADA — cuánto se mueven las dos anclas medidas, 375 y 1440')

const ANCLAS = [ANCHOS[0], ANCHOS[1]]
const desplazamientos = ANCLAS.flatMap((ancho) =>
  NIVELES_DE_DISPLAY.map((nivel) => {
    const antes = escalaA(ancho).find((n) => n.nivel === nivel)!.px
    return { ancho, nivel, antes, despues: antes * CAP, delta: antes * (CAP - 1) }
  }),
)
for (const d of desplazamientos) {
  console.log(
    `  @${String(d.ancho).padStart(4)}  ${d.nivel.padEnd(9)} ${d.antes.toFixed(3)} → ${d.despues.toFixed(3)} px  ` +
      `(+${d.delta.toFixed(4)} px, +${((CAP - 1) * 100).toFixed(2)} %)`,
  )
}
const vara = criterioDeAceptacion()
afirmar(vara !== null, `la vara de aceptación de los 14 valores sale de \`${LAYOUT_DE_S0}\` §2.3`, vara === null ? 'NO SE ENCONTRÓ' : `error medido ${vara.errorMedido} px · criterio ${vara.criterio} px`)
const mayorDelta = Math.max(...desplazamientos.map((d) => d.delta))
afirmar(
  vara !== null && mayorDelta > vara.criterio,
  '⚠️ EL CAMBIO ES GRANDE, Y ÉSTE ES EL NÚMERO QUE LO DICE: el mayor desplazamiento supera el criterio con el que las anclas fueron aceptadas',
  vara === null ? 'sin vara' : `${mayorDelta.toFixed(4)} px = ${(mayorDelta / vara.criterio).toFixed(2)}× el criterio de ${vara.criterio} px y ${Math.round(mayorDelta / vara.errorMedido)}× el error real de ${vara.errorMedido} px`,
)
afirmar(
  desplazamientos.every((d) => d.delta > minimaHoy),
  '  y los CUATRO desplazamientos superan la separación más chica que la escala mantiene entre dos niveles vecinos',
  `mínimo ${Math.min(...desplazamientos.map((d) => d.delta)).toFixed(4)} px contra ${minimaHoy.toFixed(4)} px`,
)
controlPositivo(
  'el medidor de desplazamiento no marca movimiento donde no lo hay',
  1,
  (f: number) => ANCLAS.some((a) => NIVELES_DE_DISPLAY.some((n) => Math.abs(escalaA(a).find((x) => x.nivel === n)!.px * (f - 1)) > 1e-9)),
)


// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · ⚠️ EL NOVENO NIVEL SÍ ES CAP-DOMINANTE — lo que el rehecho del titular reabre')

/**
 * **ESTE FRENTE CERRÓ LA COMPENSACIÓN CON UNA PREMISA REFUTADA, Y EL NOVENO
 * NIVEL NO ENTRA EN ESA REFUTACIÓN.**
 *
 * El argumento de §5 y del censo de mayúsculas es: la compensación de cap
 * height importaría si los niveles grandes fueran cap-dominantes, y en ESTE
 * home no lo son —van en oración, 1,7 % y 3,7 % de mayúsculas—, así que la
 * métrica que manda es la x-height, que transfiere. Eso sigue siendo cierto
 * para los ocho niveles que §2.1 midió.
 *
 * **La línea 1 del titular del hero va en MAYÚSCULAS COMPLETAS.** Para ese
 * nivel la cap height no es «una métrica que casi no se ve»: es la única altura
 * que hay. O sea que el nivel `display` es el primer nivel cap-dominante de
 * este home, y la decisión de §5 —«no se aplica ninguna compensación»— no lo
 * cubre con su propio argumento.
 *
 * ⚠ **Y NO LO ARREGLA UNA COMPENSACIÓN, por una razón que ya está medida.** El
 * factor de cap del sistema (720/686) sale de comparar Chivo contra Instrument
 * Sans, y este nivel **no se pinta con Chivo**: se pinta con Archivo, cuya cap
 * height es 686 — EL MISMO número que Chivo, leído de los dos binarios. Entre
 * las dos caras del titular no hay desvío de cap que compensar. Lo que queda
 * abierto es la comparación contra Instrument Sans, o sea la pregunta original
 * de §16, y para este nivel la respuesta ya no puede salir del censo de
 * mayúsculas.
 *
 * ⚠ **El censo NO LO VE, y se declara.** `cargaDeMayusculas()` recorre los
 * nodos con `data-nivel` —el atributo que emiten los componentes de
 * `tipografia/`— y el titular del hero no sale por ahí: sale por dos
 * `CanalDePieza`. Así que el 100 % de mayúsculas de este nivel **no aparece en
 * la tabla de §4 de `s16-afirmaciones`**, y lo que se afirma abajo se deriva de
 * la tabla de niveles y de la constante que el Hero renderiza, no del censo.
 */
const CLASES_DE_LA_LINEA_1 = TIPOGRAFIA_DEL_TITULAR.split(/\s+/)
afirmar(
  CLASES_DE_LA_LINEA_1.includes(NIVELES_TIPOGRAFICOS.display.claseFluida ?? ''),
  'la línea 1 del titular del hero se pinta con el nivel `display`',
  TIPOGRAFIA_DEL_TITULAR,
)
afirmar(
  CLASES_DE_LA_LINEA_1.includes('uppercase'),
  '  y va en MAYÚSCULAS COMPLETAS: es el primer nivel cap-dominante de este home',
  '100 % de mayúsculas por construcción, no por el copy',
)
afirmar(
  !NIVELES_DE_DISPLAY.includes('display'),
  '  y el censo de mayúsculas de §4 no lo mide: no está entre los niveles que `COMPONENTS.md` §2.1 midió',
  `el censo mira ${NIVELES_DE_DISPLAY.join(' y ')}`,
)
const ARCHIVO_MEDIDO = leerMetricas(FUENTE_DISPLAY)
afirmarIgual(
  ARCHIVO_MEDIDO.capHeight,
  CHIVO_MEDIDO.capHeight,
  '⚠️ PERO NO HAY DESVÍO DE CAP QUE COMPENSAR ENTRE LAS DOS CARAS DEL TITULAR: Archivo y Chivo declaran la MISMA cap height',
)
console.log(
  `  las dos caras del titular: Chivo cap ${CHIVO_MEDIDO.capHeight}/${CHIVO_MEDIDO.unidadesPorEm} · ` +
    `Archivo cap ${ARCHIVO_MEDIDO.capHeight}/${ARCHIVO_MEDIDO.unidadesPorEm} — leídas de los dos \`.woff2\` que /v3 sirve.`,
)
console.log(
  '  QUEDA ABIERTO y no lo cierra este frente: para el nivel `display` la pregunta de §16 —¿la escala ' +
    'tendría que compensar la cap contra Instrument Sans?— no se puede contestar con el censo de ' +
    'mayúsculas, porque ese nivel es 100 % mayúsculas. Es del sprint que cierre los otros anchos.',
)
controlPositivo(
  'el chequeo de «va en mayúsculas» ve una tipografía que no las lleva',
  'font-titulo text-fluido-titulo-xl leading-titulo tracking-titulo',
  (t: string) => t.split(/\s+/).includes('uppercase'),
)

// ═══════════════════════════════════════════════════════════════════════════
afirmarDondeManda()

// ═══════════════════════════════════════════════════════════════════════════
afirmarLaProcedencia()

// ═══════════════════════════════════════════════════════════════════════════
afirmarElEmpate()

cerrar('s16-tipografia.invariant')
