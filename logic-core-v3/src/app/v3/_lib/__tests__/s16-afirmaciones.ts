/**
 * LAS AFIRMACIONES §6 A §8 DE `s16-tipografia.invariant.ts`.
 *
 * Salen del invariante por la regla de las 300 líneas del repo, y el corte es el
 * mismo que `s3-banda-afirmaciones.ts` usa: **el modelo por un lado y lo que se
 * afirma de él por el otro**, para que un control positivo pueda correr LA MISMA
 * función contra una entrada equivocada sin que el arnés viva adentro del
 * archivo que mide.
 *
 * Las tres que viven acá son las que CIERRAN el frente:
 *
 *   · §6 — dónde manda cada métrica, medido sobre el documento y no argumentado.
 *   · §7 — de qué familia salieron los 14 valores, leído de los documentos.
 *   · §8 — el empate que ningún número de este repo rompe, y por eso esto frena.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'
import { leer } from './s3-archivos'
import { ANCHOS_DE_LA_BANDA } from './s3-banda'
import {
  CHIVO_MEDIDO,
  COMPENSACION_DE_CAP,
  COMPENSACION_DE_X,
  NIVELES_DE_DISPLAY,
  desplazamientoMaximo,
  desviosBajo,
  peorDesvioEnPx,
  tintaVerticalDe,
  valoresDeclarados,
  valoresQueSeMueven,
} from './s16-compensacion'
import {
  LAYOUT_DE_S0,
  REPORTE_DE_S0,
  cargaDeMayusculas,
  cifrasJuntoA,
  contarMayusculas,
  criterioDeAceptacion,
  cuentaDeFranco,
  normalizarSaltos,
} from './s16-lectura'

const CAP = COMPENSACION_DE_CAP.factor
const X = COMPENSACION_DE_X.factor

/**
 * §6 — DÓNDE MANDA CADA MÉTRICA, MEDIDO.
 *
 * La premisa del frente dice: «el cuerpo de texto es mayormente minúscula y ahí
 * manda la x-height; los niveles de display van en Title Case y ahí manda la
 * cap». La primera mitad se sostiene. **La segunda no**, y este bloque publica
 * el número que la refuta sobre ESTE home.
 */
export function afirmarDondeManda(): void {
  titulo('6 · Dónde manda cada métrica — MEDIDO sobre el home compuesto')

  const carga = cargaDeMayusculas()
  for (const c of carga) {
    console.log(
      `  ${c.nivel.padEnd(10)} ${String(c.elementos).padStart(3)} elem · ${String(c.letras).padStart(5)} letras · ` +
        `${String(c.mayusculas).padStart(4)} mayúsculas = ${c.porciento.toFixed(1).padStart(5)} % · ` +
        `${c.conMayuscula}/${c.elementos} elementos llevan al menos una`,
    )
  }
  const ordenados = [...carga].sort((a, b) => b.porciento - a.porciento)
  afirmarIgual(
    ordenados[0].nivel,
    'micro',
    '⚠️ EL NIVEL DONDE LA MAYÚSCULA MANDA ES `micro` (lleva `uppercase`), y es el MÁS CHICO de la escala',
  )
  const display = carga.filter((c) => NIVELES_DE_DISPLAY.includes(c.nivel))
  const cuerpo = carga.find((c) => c.nivel === 'cuerpo')
  afirmar(
    display.every((c) => c.porciento < 6),
    '⚠️ PREMISA REFUTADA: los niveles de display de ESTE home NO van en Title Case — van en oración',
    display.map((c) => `${c.nivel} ${c.porciento.toFixed(1)} %`).join(' · '),
  )
  afirmar(
    cuerpo !== undefined && display.every((c) => c.porciento < cuerpo.porciento + 2),
    `  y quedan pegados a \`cuerpo\` (${cuerpo?.porciento.toFixed(1) ?? '?'} %), que es el régimen donde la propia premisa dice que manda la x-height`,
    `los dos más bajos después de cuerpo, sobre ${carga.length} niveles con tinta`,
  )
  controlPositivo(
    'el contador de mayúsculas no da cap-dominante a un texto en minúscula',
    { texto: 'construimos software que trabaja', clases: 'text-fluido-titulo-xl' },
    (e: { texto: string; clases: string }) => contarMayusculas(e.texto, e.clases).mayusculas > 0,
  )
  afirmarIgual(
    contarMayusculas('abc', 'uppercase inline-block').mayusculas,
    3,
    '  y sí aplica `uppercase` antes de contar: sin eso `micro` se contaría como minúscula',
  )
}

/**
 * §7 — DE QUÉ FAMILIA SALIERON LOS 14 VALORES.
 *
 * El argumento que justifica compensar dice que las anclas «se transfirieron
 * midiendo Instrument Sans». Los documentos dicen otra cosa: Instrument Sans es
 * la PORTADORA —recibió los px sin reescalarlos— y la familia de ORIGEN tiene
 * x-height 504. Su cap height **no está en el repo**, así que el factor 720/686
 * apunta a la óptica de la portadora y no a la del origen.
 */
export function afirmarLaProcedencia(): void {
  titulo('7 · De qué familia salieron los 14 valores — leído de los documentos')

  const franco = cuentaDeFranco()
  afirmar(
    franco !== null,
    `\`${REPORTE_DE_S0}\` §(b) publica la cuenta de la familia de ORIGEN`,
    franco === null ? 'NO SE ENCONTRÓ' : `${franco.origen}/${franco.portadora} = ${franco.factor}`,
  )
  afirmar(
    franco !== null && franco.origen !== CHIVO_MEDIDO.xHeight && franco.origen !== franco.portadora,
    '⚠️ PREMISA REFUTADA: los 14 valores NO se transfirieron midiendo Instrument Sans — su x-height de origen es 504, no 510',
    franco === null
      ? 'sin cuenta'
      : `origen ${franco.origen} · portadora ${franco.portadora} · Chivo ${CHIVO_MEDIDO.xHeight}`,
  )
  const docs = [leer(REPORTE_DE_S0), leer(LAYOUT_DE_S0)]
  const caps = cifrasJuntoA(docs, /cap height/i)
  const equis = cifrasJuntoA(docs, /x-height/i)
  console.log(`  cap heights en los dos documentos: ${caps.join(' · ')}   ·   x-heights: ${equis.join(' · ')}`)
  afirmarIgual(
    caps,
    [CHIVO_MEDIDO.capHeight, COMPENSACION_DE_CAP.deInstrumentSans].sort((a, b) => a - b),
    '⚠️ el repo conoce la cap height de DOS familias — Chivo y la portadora. La de ORIGEN no está en ningún lado',
  )
  controlPositivo(
    'el escáner de cifras no se come el decimal de un factor: `0,998` no es una métrica de 998 unidades',
    ['la x-height da un factor de 0,998 contra la portadora'],
    (textos: string[]) => cifrasJuntoA(textos, /x-height/i).length > 0,
  )
  afirmar(
    !caps.includes(franco?.origen ?? -1),
    '  o sea que «compensar es más fiel a la referencia» NO se puede verificar con ningún número de este repo: apunta a la óptica de la PORTADORA',
    'hueco declarado: la cap height de la familia de origen es [desconocido]',
  )
  const conCrlf = leer(REPORTE_DE_S0).replace(/\r?\n/g, '\r\n')
  afirmar(
    cuentaDeFranco(conCrlf) !== null && cuentaDeFranco(normalizarSaltos(conCrlf)) !== null,
    '  y el lector encuentra la cifra con los DOS finales de línea: CRLF y LF',
    'el árbol corre con core.autocrlf en true y los dos documentos están en CRLF',
  )
  controlPositivo(
    'el lector de la cuenta no acepta un documento donde la cifra cambió',
    leer(REPORTE_DE_S0).replace('504/510', '777/510'),
    (texto: string) => cuentaDeFranco(texto)?.origen === 504,
  )
}

/**
 * §8 — EL EMPATE, Y LA DECISIÓN.
 *
 * La MISMA medición ordena al revés según la unidad: en por ciento compensar la
 * cap empeora el peor desvío, en píxeles lo mejora. Ningún número de este repo
 * rompe ese empate; lo rompe la verificación óptica que el tema tiene declarada
 * pendiente desde S0 y que juzga un humano.
 */
export function afirmarElEmpate(): void {
  titulo('8 · El empate que ningún número del repo rompe — y por eso esto FRENA')

  for (const [etiqueta, f] of [['hoy', 1], ['cap', CAP], ['x  ', X]] as const) {
    const d = desviosBajo(f)
    console.log(
      `  ${etiqueta}  cap ${d.cap.toFixed(4).padStart(8)} %  ·  x ${d.x.toFixed(4).padStart(7)} %  →  ` +
        `peor métrica ${d.peor.toFixed(4)} %  ·  suma ${d.suma.toFixed(4)} puntos`,
    )
  }
  afirmar(
    desviosBajo(CAP).peor > desviosBajo(1).peor,
    '⚠️ EN POR CIENTO, COMPENSAR LA CAP EMPEORA: cambia un déficit de cap por un exceso de x MÁS GRANDE',
    `peor métrica ${desviosBajo(1).peor.toFixed(4)} % → ${desviosBajo(CAP).peor.toFixed(4)} % · ` +
      `suma ${desviosBajo(1).suma.toFixed(4)} → ${desviosBajo(CAP).suma.toFixed(4)} puntos`,
  )

  const nivel = NIVELES_DE_DISPLAY[NIVELES_DE_DISPLAY.length - 1]
  const ancho = ANCHOS_DE_LA_BANDA[1].px
  for (const [etiqueta, f] of [['hoy', 1], ['cap', CAP]] as const) {
    const t = tintaVerticalDe(nivel, ancho, f)
    console.log(
      `  ${etiqueta}  ${nivel} @${ancho}: ${t.px.toFixed(3)} px  ·  déficit de cap ${t.deficitDeCap.toFixed(4)} px  ·  ` +
        `exceso de x ${t.excesoDeX.toFixed(4)} px  →  peor ${peorDesvioEnPx(nivel, ancho, f).toFixed(4)} px`,
    )
  }
  const hoy = peorDesvioEnPx(nivel, ancho, 1)
  const compensado = peorDesvioEnPx(nivel, ancho, CAP)
  afirmar(
    compensado < hoy,
    '⚠️ EN PÍXELES, COMPENSAR LA CAP MEJORA — y ahí está el empate: las dos lecturas de la MISMA medición se ordenan al revés',
    `${hoy.toFixed(4)} px → ${compensado.toFixed(4)} px, un ${(((hoy - compensado) / hoy) * 100).toFixed(1)} % menos`,
  )
  controlPositivo(
    'el comparador de desvíos no dice «empeora» siempre: con el factor 1 no hay diferencia consigo mismo',
    1,
    (f: number) => desviosBajo(f).peor > desviosBajo(1).peor,
  )
  console.log(decisionDelFrente())
}

/**
 * LA DECISIÓN, con sus cifras DERIVADAS y no escritas.
 *
 * Es la regla 14 aplicada al párrafo que más se va a citar: si mañana la
 * compensación cambia de tamaño, el texto que la rechaza cambia con ella en vez
 * de quedar describiendo un número que ya no es.
 */
export function decisionDelFrente(): string {
  const mueve = valoresQueSeMueven(CAP)
  const total = valoresDeclarados().length
  const vara = criterioDeAceptacion()
  const salto = desplazamientoMaximo(CAP)
  const display = cargaDeMayusculas().filter((c) => NIVELES_DE_DISPLAY.includes(c.nivel))
  return (
    '\n  🛑 **DECISIÓN DE ESTE FRENTE: NO SE APLICA NINGUNA COMPENSACIÓN, Y EL TEMA QUEDA COMO ESTÁ.**\n' +
    `  Los tres números que frenan, en orden: (1) la de cap mueve ${mueve.length} de ${total} valores declarados,\n` +
    `  con un desplazamiento de hasta ${salto.toFixed(2)} px sobre el ancla de 1440 — ` +
    `${vara === null ? '?' : (salto / vara.criterio).toFixed(2)}× el criterio de ${vara?.criterio ?? '?'} px\n` +
    `  con el que esas anclas fueron aceptadas y ${vara === null ? '?' : Math.round(salto / vara.errorMedido)}× su error real de ${vara?.errorMedido ?? '?'} px;\n` +
    `  (2) en por ciento la compensación EMPEORA el peor desvío, de ${desviosBajo(1).peor.toFixed(2)} % a ${desviosBajo(CAP).peor.toFixed(2)} %;\n` +
    '  (3) la premisa que la justificaba —«los niveles de display van en Title Case»— está refutada sobre\n' +
    `  este home: van en oración, con ${display.map((c) => `${c.porciento.toFixed(1)} %`).join(' y ')} de mayúsculas.\n` +
    '  Lo único que queda a favor es la lectura en PÍXELES, que ordena al revés. Ese empate NO lo rompe\n' +
    '  ningún número de este repo: lo rompe la verificación óptica que el tema tiene declarada pendiente\n' +
    '  desde S0, sobre `/v3/tipografia`, y la juzga un humano. Este invariante deja la medición escrita\n' +
    '  para que la decisión se tome con ella y no con un reporte que envejece.'
  )
}
