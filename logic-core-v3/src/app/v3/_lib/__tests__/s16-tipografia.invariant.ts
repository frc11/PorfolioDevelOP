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
  LOS_OCHO,
  NINGUNO,
  NIVELES_DE_DISPLAY,
  type Alcance,
  desplazamientoMaximo,
  escalaCompensadaA,
  valoresDeclarados,
  valoresQueSeMueven,
} from './s16-compensacion'
import { LAYOUT_DE_S0, criterioDeAceptacion } from './s16-lectura'

const ANCHOS = ANCHOS_DE_LA_BANDA.map((a) => a.px)
const CAP = COMPENSACION_DE_CAP.factor
const X = COMPENSACION_DE_X.factor

/** Las tres hipótesis que este frente evalúa. `hoy` es la que el tema aplica. */
const HIPOTESIS: readonly { nombre: string; factor: number; alcance: Alcance }[] = [
  { nombre: 'hoy         ', factor: 1, alcance: NINGUNO },
  { nombre: 'cap·display ', factor: CAP, alcance: NIVELES_DE_DISPLAY },
  { nombre: 'cap·los ocho', factor: CAP, alcance: LOS_OCHO },
  { nombre: 'x·los ocho  ', factor: X, alcance: LOS_OCHO },
]

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
afirmarIgual(DECLARADOS.length, 14, 'son 14 los valores que una compensación tocaría: 8 tokens + 6 pisos')
console.log(`  ${DECLARADOS.map((v) => `${v.donde.replace('--text-', '')} ${v.px}`).join(' · ')}`)
afirmarIgual(
  DECLARADOS.filter((v) => !Number.isInteger(v.px)).map((v) => v.donde),
  [],
  'los 14 son ENTEROS en la hoja: ningún factor de familia se aplicó nunca a esta escala',
)
controlPositivo(
  'el detector de una escala ya compensada la ve: con el factor de la cap ninguno queda entero',
  CAP,
  (f: number) => DECLARADOS.every((v) => Number.isInteger(v.px * f)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los 14 valores bajo cada factor — 0 de 14 contra 12 de 14')

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
  '⚠️ la compensación de X MUEVE 0 DE 14: el instrumento reproduce `REPORTE-S0.md` §(b), que era una cita',
)
afirmar(
  desplazamientoMaximo(X) < 0.11,
  '  y su desplazamiento máximo es sub-décima de píxel: es una no-operación, no una decisión',
  `${desplazamientoMaximo(X).toFixed(4)} px sobre --text-titulo-xl`,
)
afirmarIgual(
  valoresQueSeMueven(CAP).length,
  12,
  '⚠️ la compensación de CAP mueve 12 de 14 — sólo `micro` y su piso aguantan el redondeo',
)
controlPositivo(
  'el contador de valores movidos no está clavado en cero',
  CAP,
  (f: number) => valoresQueSeMueven(f).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Los ocho niveles en los cuatro anchos, bajo las cuatro hipótesis')

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
  ['x·los ocho'],
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
afirmarDondeManda()

// ═══════════════════════════════════════════════════════════════════════════
afirmarLaProcedencia()

// ═══════════════════════════════════════════════════════════════════════════
afirmarElEmpate()

cerrar('s16-tipografia.invariant')
