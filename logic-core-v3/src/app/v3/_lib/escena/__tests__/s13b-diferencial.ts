/**
 * LA VENTANA DEL DIFERENCIAL — cobertura del logo y contraste, medidos JUNTOS
 * sobre todo el rango en el que la sección puede caer.
 *
 * ── La pregunta, y por qué las dos mitades no alcanzan por separado ────────
 *
 * §7.46 defecto 7: en `por-que-develop` la superposición del logo con el titular
 * es 6–16% en el mejor caso y el contraste ahí es 1,11:1 —invisible—. La salida
 * de layout se descartó con el barrido de 81 bandas de `s10-logo-columna.ts`, así
 * que lo que queda es MOVER la sección a otro progreso. Pero las dos cosas que
 * hay que cumplir **tiran para lados opuestos**:
 *
 *   · **el logo se achica al avanzar** — la cámara se aleja de 9 a 27, así que
 *     cuanto más tarde caiga la sección menos cuadro tapa;
 *   · **la escena se apaga al avanzar** — `LIGHT_ARC` es una tarde y el
 *     contraste del peor píxel del fondo baja monótono, así que cuanto más tarde
 *     caiga la sección menos se lee su texto.
 *
 * Por eso la instrucción pide los dos **juntos**: una ventana es un progreso
 * donde el logo ya deja lugar Y la escena todavía tiene contraste.
 *
 * ── LOS DOS CRITERIOS, DERIVADOS Y NO ELEGIDOS ────────────────────────────
 *
 * Ninguno es un umbral inventado para este archivo:
 *
 *   · **El logo pasa** cuando la superposición MÍNIMA del bloque de texto más
 *     grande de la sección, barrida sobre todas las posiciones verticales que
 *     caben, es **cero** — o sea, cuando existe una altura de pantalla en la que
 *     el titular queda limpio. Es exactamente la bandera `inevitable` que
 *     `s10-logo-tablas.ts` ya publica, evaluada progreso por progreso en vez de
 *     sólo en el ancla de hoy. Y es el criterio correcto y no uno de cobertura,
 *     porque sobre el logo el contraste es ~1:1 **por construcción** —la tinta
 *     del texto y la del logo son el mismo negro, afirmado en `s10-logo` §5—:
 *     donde se superponen no hay número que lo salve.
 *   · **El contraste pasa** cuando el peor píxel del cuadro contra `TINTA_HEX`
 *     llega a AA (4,5:1). Es la misma medición y el mismo estadístico con los que
 *     `s8-tinta.invariant.ts` §3 publica el cruce de AA del recorrido.
 *
 * La cobertura del cuadro se publica igual, en la tabla, porque es la cifra con
 * la que la instrucción describe el problema (35,7% → 5,3%) y porque un lector
 * tiene que poder cruzar las dos lecturas.
 */

import { afirmar, afirmarIgual, controlPositivo, razonDeContraste, titulo } from '../../__tests__/afirmar'
import { TINTA_HEX } from '../../superficies'
import { TRAMOS_ANCLADOS } from '../anclaje'
import { aCuadroAlto, aCuadroX } from './s10-logo-cajas'
import { muestrearLogo } from './s10-logo'
// prettier-ignore
import { ESCENA_REAL, VENTANAS, barridoVertical, cobertura, contrasteSobreElFondo, fraccionDentro, mayorCaja, type Ventana } from './s10-logo-lectura'
// prettier-ignore
import { EL_DIFERENCIAL, anclasAlcanzables, particiones, repartosPosibles, tablaDeRepartos } from './s13b-reparto'

/** AA para texto normal, igual que en `s8-tinta`. */
export const AA = 4.5

/**
 * LA GRILLA DEL BARRIDO, y por qué no es la de publicación.
 *
 * `s10-logo-lectura.muestra` usa 300 × 220 y tarda ~200 ms por muestra: un
 * barrido de setenta progresos por cinco cuadros serían dos minutos. Acá se
 * muestrea con una grilla más gruesa y **la equivalencia con la de publicación
 * se afirma**, en vez de suponerse: es §4 del invariante.
 */
export const COLUMNAS = 160
export const FILAS = 118
export const FACTOR = 2.6

const cache = new Map<string, ReturnType<typeof muestrearLogo>>()

export function muestraDelBarrido(progreso: number, aspecto: number) {
  const clave = `${progreso}|${aspecto}`
  const guardada = cache.get(clave)
  if (guardada !== undefined) return guardada
  const nueva = muestrearLogo(progreso, aspecto, ESCENA_REAL, COLUMNAS, FILAS, FACTOR)
  cache.set(clave, nueva)
  return nueva
}

/** La caja de texto más grande del diferencial, en coordenadas de cuadro. */
export interface CajaEnElCuadro {
  readonly ventana: Ventana
  readonly etiqueta: string
  readonly x0: number
  readonly x1: number
  readonly alto: number
}

export function cajaDelDiferencial(v: Ventana): CajaEnElCuadro {
  const caja = mayorCaja(EL_DIFERENCIAL, v.ancho)
  return {
    ventana: v,
    etiqueta: caja.etiqueta,
    x0: aCuadroX(caja.banda.izquierda, v.ancho),
    x1: aCuadroX(caja.banda.izquierda + caja.banda.ancho, v.ancho),
    alto: aCuadroAlto(caja.altoPx, v.alto),
  }
}

/** La superposición mínima del titular en un progreso: 0 = el bloque puede quedar limpio. */
export function superposicionMinima(caja: CajaEnElCuadro, progreso: number): number {
  return barridoVertical(
    muestraDelBarrido(progreso, caja.ventana.aspecto),
    caja.x0,
    caja.x1,
    caja.alto,
    100,
  ).minima
}

// ── Los dos bordes de la ventana, por bisección ─────────────────────────────

/**
 * EL PROGRESO A PARTIR DEL CUAL EL TITULAR PUEDE QUEDAR LIMPIO, por cuadro.
 *
 * ⚠ **No se bisecta a ciegas, y la razón es que la función NO es monótona**: la
 * superposición vale cero al principio del rango —el logo todavía está lejos y
 * chico—, sube hasta la pose `demos` y vuelve a caer a cero. Bisecar sobre todo
 * el rango encontraría el primer cruce, que es el equivocado. Se barre grueso
 * para encontrar **el último progreso con superposición**, y recién ahí se
 * bisecta contra la muestra siguiente.
 */
export function limpioDesde(caja: CajaEnElCuadro, desde: number, hasta: number, paso = 0.005): number {
  let ultimoSucio = Number.NaN
  for (let p = desde; p <= hasta + 1e-9; p += paso) {
    if (superposicionMinima(caja, p) > 0) ultimoSucio = p
  }
  if (!Number.isFinite(ultimoSucio)) return desde
  let lo = ultimoSucio
  let hi = Math.min(hasta, ultimoSucio + paso)
  for (let i = 0; i < 14; i += 1) {
    const m = (lo + hi) / 2
    if (superposicionMinima(caja, m) > 0) lo = m
    else hi = m
  }
  return hi
}

/** El progreso en el que el peor píxel del fondo deja de llegar a AA. */
export function cruceDeAA(umbral = AA): number {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 16; i += 1) {
    const m = (lo + hi) / 2
    if (contrasteSobreElFondo(m) >= umbral) lo = m
    else hi = m
  }
  return (lo + hi) / 2
}

export interface VentanaDelDiferencial {
  /** El borde de abajo: el último cuadro en quedar limpio manda. */
  readonly desde: number
  /** El borde de arriba: donde el fondo deja de llegar a AA. */
  readonly hasta: number
  readonly existe: boolean
  /** Por cuadro, desde dónde queda limpio. Es de dónde sale `desde`. */
  readonly limpioPorCuadro: readonly (readonly [string, number])[]
}

export function ventanaDelDiferencial(cajas: readonly CajaEnElCuadro[]): VentanaDelDiferencial {
  const limpioPorCuadro = cajas.map(
    (c): readonly [string, number] => [c.ventana.etiqueta, limpioDesde(c, 0.625, 1)],
  )
  const desde = limpioPorCuadro.reduce((m, [, p]) => Math.max(m, p), 0)
  const hasta = cruceDeAA()
  return { desde, hasta, existe: desde < hasta, limpioPorCuadro }
}

// ── La tabla que se publica ─────────────────────────────────────────────────

export function tablaDelDiferencial(
  cajas: readonly CajaEnElCuadro[],
  desde = 0.625,
  hasta = 1,
  paso = 0.0125,
): readonly string[] {
  const lineas = [
    `p        C(fondo)  AA  ` + cajas.map((c) => `${c.ventana.etiqueta}: cob/dentro/sup.mín`).join('  '),
  ]
  for (let i = 0; ; i += 1) {
    const p = desde + paso * i
    if (p > hasta + 1e-9) break
    const c = contrasteSobreElFondo(p)
    const cols = cajas.map((caja) => {
      const m = muestraDelBarrido(p, caja.ventana.aspecto)
      const s = superposicionMinima(caja, p)
      return (
        `${(cobertura(m) * 100).toFixed(1).padStart(5)}% ` +
        `${(fraccionDentro(m) * 100).toFixed(1).padStart(5)}% ` +
        `${(s * 100).toFixed(1).padStart(5)}%`
      )
    })
    lineas.push(`${p.toFixed(4)}  ${c.toFixed(3).padStart(7)}:1 ${c >= AA ? 'sí' : ' ·'}  ${cols.join('  ')}`)
  }
  return lineas
}

/** Los cuadros del barrido: los cuatro que §7.40 ya usa. */
export const CAJAS_DEL_DIFERENCIAL: readonly CajaEnElCuadro[] = VENTANAS.map(cajaDelDiferencial)

/** La tinta contra sí misma: el techo de lo que se puede leer SOBRE el logo. */
export const TINTA_CONTRA_TINTA = razonDeContraste(TINTA_HEX, TINTA_HEX)

/**
 * §4 DEL INVARIANTE, ENTERA — la tabla, la ventana y el espacio de anclajes.
 *
 * Vive acá por la regla de las 300 líneas, con el mismo corte que
 * `s10-logo-columna.ts` estrenó para el §9 de `s10-logo`: **por tema, y sin
 * compartir una constante con lo que queda del otro lado.**
 *
 * ⚠️ **LA DECISIÓN YA ESTÁ TOMADA: la salida (c)** —sacarle la cuantización al
 * ancla, sin tocar poses ni `secciones.ts`—. El porqué completo, con los dos
 * valores alcanzables y la ventana, vive en el docblock de `TRAMOS_ANCLADOS`
 * (`anclaje.ts`). Acá queda su MEDICIÓN, corriendo: el día que el sprint
 * siguiente construya el ancla libre, «ninguno cae adentro» se pone en rojo y
 * **ése es el aviso de que ya se puede re-anclar**.
 */
export function afirmarLaVentanaDelDiferencial(): void {
  titulo('4 · 🔴 LA VENTANA DEL DIFERENCIAL — cobertura y contraste juntos, y el espacio de anclajes')

  const equivalencias = [0.75, 0.875].map((p) => {
    const aspecto = CAJAS_DEL_DIFERENCIAL[0].ventana.aspecto
    const gruesa = cobertura(muestraDelBarrido(p, aspecto))
    const fina = cobertura(muestrearLogo(p, aspecto, ESCENA_REAL, 300, 220, FACTOR))
    return Math.abs(gruesa - fina)
  })
  afirmar(
    equivalencias.every((d) => d < 0.005),
    'CONTROL DE EQUIVALENCIA — la grilla del barrido mide lo mismo que la de publicación',
    `diferencia máxima de cobertura ${(100 * Math.max(...equivalencias)).toFixed(3)} puntos entre ${COLUMNAS}×${FILAS} y 300×220`,
  )

  for (const c of CAJAS_DEL_DIFERENCIAL) {
    console.log(
      `  ${c.ventana.etiqueta.padEnd(11)} caja ${c.etiqueta} · alto ${c.alto.toFixed(3)} de cuadro · ` +
        `banda x=[${c.x0.toFixed(3)}, ${c.x1.toFixed(3)}]`,
    )
  }
  for (const linea of tablaDelDiferencial(CAJAS_DEL_DIFERENCIAL)) console.log(`  ${linea}`)

  const ventana = ventanaDelDiferencial(CAJAS_DEL_DIFERENCIAL)
  console.log(
    `  el titular queda limpio desde: ${ventana.limpioPorCuadro.map(([e, p]) => `${e} ${p.toFixed(4)}`).join(' · ')}`,
  )
  afirmar(
    TINTA_CONTRA_TINTA < AA,
    'sobre el logo NO hay contraste que valga: la tinta del texto y la del logo son el mismo negro',
    `${TINTA_CONTRA_TINTA.toFixed(2)}:1 — por eso el criterio del logo es «superposición mínima CERO» y no un umbral de cobertura`,
  )
  afirmar(
    ventana.existe,
    `LA VENTANA EXISTE — p=[${ventana.desde.toFixed(4)}, ${ventana.hasta.toFixed(4)}]`,
    `desde donde el titular puede quedar limpio en los ${CAJAS_DEL_DIFERENCIAL.length} cuadros, hasta donde el peor píxel del fondo deja de llegar a AA (${AA}:1)`,
  )
  controlPositivo(
    'el criterio del logo no es un `true` constante: en la pose `demos` el titular NO puede quedar limpio',
    0.75,
    (p: number) => CAJAS_DEL_DIFERENCIAL.every((c) => superposicionMinima(c, p) === 0),
  )

  const repartos = repartosPosibles(TRAMOS_ANCLADOS.map((a) => a.secciones.join('+')).join(' | '))
  for (const linea of tablaDeRepartos(repartos)) console.log(`  ${linea}`)
  const anclas = anclasAlcanzables(repartos)
  afirmar(
    repartos.some((r) => r.esElDeHoy && r.anclaje !== null),
    'EL ESPACIO ESTÁ COMPLETO: el reparto que el repo despacha aparece entre los enumerados',
    `${repartos.length} repartos posibles · ${repartos.filter((r) => r.anclaje !== null).length} derivan · el resto lo rechaza un guardián`,
  )
  controlPositivo(
    'el generador de particiones no inventa: no hay forma de partir 6 secciones en 7 grupos',
    7,
    (grupos: number) => particiones(6, grupos).length > 0,
  )
  afirmarIgual(
    anclas.map((a) => Number(a.toFixed(6))),
    [0.75, 0.916667],
    'EL ANCLA DEL DIFERENCIAL ESTÁ CUANTIZADA: `TRAMOS_ANCLADOS` sólo puede producir DOS valores',
  )
  afirmar(
    anclas.every((a) => a < ventana.desde || a > ventana.hasta),
    '🔴 Y NINGUNO DE LOS DOS CAE ADENTRO DE LA VENTANA — por eso el diferencial NO se re-ancla',
    `${anclas.map((a) => a.toFixed(4)).join(' y ')} contra [${ventana.desde.toFixed(4)}, ${ventana.hasta.toFixed(4)}]` +
      ` · el de hoy queda ${(ventana.desde - anclas[0]).toFixed(4)} corto y el otro se pasa ${(anclas[anclas.length - 1] - ventana.hasta).toFixed(4)}`,
  )
  const supHoy = CAJAS_DEL_DIFERENCIAL.map((c) => superposicionMinima(c, anclas[0]))
  console.log(
    '  LAS TRES SALIDAS, CON SU NÚMERO — y la decisión del dueño del proyecto al lado:\n' +
      `   (a) dejarlo en ${anclas[0].toFixed(4)} — el titular se superpone con el logo entre ` +
      `${(100 * Math.min(...supHoy)).toFixed(1)}% y ${(100 * Math.max(...supHoy)).toFixed(1)}% según el cuadro, y ahí el contraste\n` +
      `       es ${TINTA_CONTRA_TINTA.toFixed(2)}:1. Es el defecto 7 tal como está. DESCARTADA.\n` +
      `   (b) moverlo a ${anclas[anclas.length - 1].toFixed(4)} (\`cierre\` sobre tu-panel + por-que-develop) — el titular queda limpio en los cuatro\n` +
      `       cuadros y el fondo cae a ${contrasteSobreElFondo(anclas[anclas.length - 1]).toFixed(2)}:1: pone \`s8-tinta\` §5 en ROJO. Además la pose \`demos\`\n` +
      '       deja de verse nunca. DESCARTADA.\n' +
      '   (c) hacer que exista un ancla ADENTRO de la ventana. ✅ **ELEGIDA**, y en la forma que NO toca\n' +
      '       ninguna pose ni `secciones.ts`: que el ancla deje de estar cuantizada a un borde de tramo —\n' +
      '       que el reparto pueda declarar dónde ADENTRO de su tramo ancla una sección. Cae entera en\n' +
      '       `anclaje.ts`, o sea en la zona de este lane, y es el SPRINT SIGUIENTE. Ver su docblock.',
  )
}
