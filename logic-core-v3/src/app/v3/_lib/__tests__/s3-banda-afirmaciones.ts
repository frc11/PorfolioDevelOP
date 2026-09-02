/**
 * LAS AFIRMACIONES DE LA BANDA — §6 a §10 de `s3-tipografia.invariant.ts`.
 *
 * Salen del invariante por la regla de las 300 líneas del repo, y el corte es
 * el mismo que el repo ya usa en `s10-mobile-escala.ts`: **el modelo por un
 * lado y las afirmaciones por el otro**, para que un control positivo pueda
 * correr LA MISMA función contra una entrada equivocada sin que el arnés viva
 * adentro del archivo que mide.
 *
 * Los tres modelos que consume viven aparte y no se mezclan:
 *
 *   · `s3-banda.ts`               — las anclas y la escala. Sólo lee la HOJA.
 *   · `s3-banda-consecuencias.ts` — el titular, las líneas y la tinta. Necesita
 *                                   el marcado del servidor.
 *   · `s3-banda-referencia.ts`    — lo que la referencia hace arriba de 1440, y
 *                                   qué familia emite cada elemento.
 */

import { CONTENIDO as HERO } from '../../_secciones/hero/contenido'
import { SECCIONES } from '../secciones'
import { NIVELES, type Nivel } from '../tipografia'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'
import {
  ANCHOS_DE_LA_BANDA,
  ANCLA_DE_LA_BANDA,
  FLUIDOS,
  MAS_ANCHO_QUE_EL_TOPE,
  PISO_DE_LA_BANDA,
  TOPE_DE_LA_BANDA,
  anchoDeCruce,
  divergenciaEn,
  escalaA,
  rectaDe,
  separacionesEn,
  type NivelResuelto,
  type Recta,
  type Separacion,
} from './s3-banda'
import {
  medidaDelTitular,
  nivelDelTitular,
  tintaPorSeccion,
  titularDelHero,
} from './s3-banda-consecuencias'
import {
  LAYOUT_DE_S0,
  censoDeFamilias,
  nivelesQueSiguenCreciendo,
  tablaDeLaReferencia,
} from './s3-banda-referencia'
import { palabrasQueNoEntran } from './s10-avance'
import { ALTOS } from './s10-banco'
import { tokenPx } from './s10-css'
import { CHIVO, tokenDeCaja, tracking } from './s10-mobile'

/** El alto de referencia de escritorio de S0. Sale de la tabla del banco. */
const ALTO_DE_ESCRITORIO = ALTOS[ALTOS.length - 1]

/**
 * §6 DEL INVARIANTE DE TIPOGRAFÍA — LA ESCALA A LO LARGO DE LOS CUATRO ANCHOS.
 *
 * Vive acá y no en el invariante por la regla de las 300 líneas, y el corte es
 * el mismo que separa este archivo de `s3-banda.ts`: acá está todo lo que
 * necesita el marcado del servidor.
 */
export function afirmarLaBanda(): void {
  titulo('6 · La banda, de punta a punta: los ocho niveles en los cuatro anchos')

  for (const { px, porQue } of ANCHOS_DE_LA_BANDA) {
    console.log(`  @${String(px).padStart(4)}  ${escalaA(px).map((n) => `${n.nivel} ${n.px.toFixed(2)}`).join(' · ')}`)
    console.log(`        ${porQue}`)
  }

  // 1 · Arriba del tope NADA se mueve. Es la respuesta a «¿y un ultra ancho?».
  //
  // ⚠ La comparación va con tolerancia y no por igualdad exacta, y el motivo es
  // un número: en el tope el `clamp()` todavía resuelve por la RECTA —le falta
  // 2·10⁻⁵ px para tocar el techo, porque el techo se publica a cuatro
  // decimales— y un píxel más ancho ya resuelve por el TECHO. Son dos caminos
  // distintos para el mismo valor. Exigir igualdad de bits ahí sería exigir que
  // el redondeo de la hoja fuera infinito.
  const TOLERANCIA_PX = 0.001
  const enElTope = escalaA(TOPE_DE_LA_BANDA).map((n) => n.px)
  const seMueven = escalaA(MAS_ANCHO_QUE_EL_TOPE)
    .filter((n, i) => Math.abs(n.px - enElTope[i]) > TOLERANCIA_PX)
    .map((n) => n.nivel)
  afirmarIgual(
    seMueven,
    [],
    `a ${MAS_ANCHO_QUE_EL_TOPE} la escala es la MISMA que en el tope: arriba de ${TOPE_DE_LA_BANDA} ningún nivel sigue creciendo`,
  )
  console.log(
    `  la mayor diferencia entre la columna del tope y la de ${MAS_ANCHO_QUE_EL_TOPE} es ` +
      `${Math.max(...escalaA(MAS_ANCHO_QUE_EL_TOPE).map((n, i) => Math.abs(n.px - enElTope[i]))).toExponential(1)} px: ` +
      'es el redondeo del techo a cuatro decimales, no un crecimiento.',
  )
  controlPositivo(
    'el comparador de columnas no dice «la misma» por costumbre: adentro de la banda SÍ cambian',
    ANCLA_DE_LA_BANDA,
    (ancho: number) => escalaA(ancho).every((n, i) => Math.abs(n.px - enElTope[i]) <= TOLERANCIA_PX),
  )

  // 2 · Sigue siendo una ESCALA en los cuatro: ocho tamaños estrictamente
  //     crecientes en el orden de la tabla, sin un solo par que colisione.
  const noCrecen = ANCHOS_DE_LA_BANDA.flatMap(({ px }) =>
    separacionesEn(escalaA(px)).filter((s) => s.px <= 0).map((s) => `@${px} ${s.de}→${s.a}`),
  )
  afirmarIgual(noCrecen, [], 'los ocho niveles crecen ESTRICTAMENTE en los cuatro anchos: ningún par colisiona ni se da vuelta')
  controlPositivo(
    'el detector de colisiones ve un par dado vuelta',
    [{ nivel: 'base', px: 20 }, { nivel: 'titulo-s', px: 17 }],
    (escala) => separacionesEn(escala as NivelResuelto[]).filter((s) => s.px <= 0).length === 0,
  )

  // 3 · La separación, ancho por ancho. **El piso es el lugar más apretado del
  //     sistema y lo era antes de V3-C**: a 375 hay CUATRO pares consecutivos a
  //     ~1px, y ni ese ancho ni el ancla se movieron en este sprint.
  const APRETADO_PX = 2
  const minimaEn = (ancho: number): Separacion =>
    separacionesEn(escalaA(ancho)).reduce((a, b) => (b.px < a.px ? b : a))
  for (const { px } of ANCHOS_DE_LA_BANDA) {
    const separaciones = separacionesEn(escalaA(px))
    const minima = minimaEn(px)
    const apretados = separaciones.filter((s) => s.px < APRETADO_PX)
    console.log(
      `  @${String(px).padStart(4)}  mínima ${minima.px.toFixed(4)} px (${minima.de}→${minima.a}) · ` +
        `${apretados.length} par(es) abajo de ${APRETADO_PX}px [${apretados.map((s) => `${s.de}→${s.a}`).join(' ')}] · ` +
        `todas: ${separaciones.map((s) => s.px.toFixed(2)).join(' · ')}`,
    )
  }
  const masApretadoQueElPiso = ANCHOS_DE_LA_BANDA.filter(
    ({ px }) => minimaEn(px).px < minimaEn(PISO_DE_LA_BANDA).px,
  ).map((a) => a.px)
  afirmarIgual(
    masApretadoQueElPiso,
    [],
    `NINGÚN ancho aprieta la escala más que el piso (${minimaEn(PISO_DE_LA_BANDA).px.toFixed(4)} px en ` +
      `${minimaEn(PISO_DE_LA_BANDA).de}→${minimaEn(PISO_DE_LA_BANDA).a}): extender la banda no cerró una sola separación por debajo de lo que ya estaba`,
  )

  // 4 · La garantía que ninguna tabla de cuatro columnas puede dar: en qué
  //     ancho se ALCANZARÍAN dos niveles si la banda no tuviera techo. Cuatro
  //     anchos muestrean; las rectas contestan para todos.
  const cruces = NIVELES.slice(1)
    .map((nivel, i) => ({ de: NIVELES[i], a: nivel, en: anchoDeCruce(rectaDe(NIVELES[i]), rectaDe(nivel)) }))
    .filter((c): c is { de: Nivel; a: Nivel; en: number } => c.en !== null)
  const primerChoque = cruces.length === 0 ? Infinity : Math.min(...cruces.map((c) => c.en))
  console.log(
    `  si la banda NO tuviera techo, el primer par en alcanzarse sería ` +
      `${cruces.map((c) => `${c.de}→${c.a} a ${c.en.toFixed(0)} px`).join(' · ') || '(ninguno: las ocho rectas no se alcanzan nunca arriba del piso)'}`,
  )
  afirmar(
    primerChoque > TOPE_DE_LA_BANDA,
    `y el techo de la banda (${TOPE_DE_LA_BANDA}) queda MUY por debajo de ese choque: la escala no puede colisionar en NINGÚN ancho, no sólo en los cuatro muestreados`,
    primerChoque === Infinity ? 'ningún par se alcanza jamás' : `choque a ${primerChoque.toFixed(0)} px, ${(primerChoque / TOPE_DE_LA_BANDA).toFixed(1)}× el tope`,
  )
  controlPositivo(
    'el solucionador de cruces ve un par que SÍ se alcanza adentro de la banda',
    { inferior: { a: 0, b: 10 }, superior: { a: 0.02, b: 1 } },
    (par: { inferior: Recta; superior: Recta }) => {
      const cruce = anchoDeCruce(par.inferior, par.superior)
      return cruce === null || cruce > TOPE_DE_LA_BANDA
    },
  )

  // 5 · El titular del Hero: la fracción de ventana que el ojo lee como
  //     «chico», y las líneas que P1 anima.
  titulo(`7 · El titular del Hero (\`${nivelDelTitular()}\`) como fracción de la ventana`)
  for (const { px } of ANCHOS_DE_LA_BANDA) {
    const t = titularDelHero(px)
    console.log(
      `  @${String(px).padStart(4)}  ${t.tamano.toFixed(2)} px · medida ${t.medida.toFixed(0)} px · tinta ${t.tinta.toFixed(0)} px  →  ` +
        `**${(t.fraccion * 100).toFixed(1)} % de la ventana** · corta en ${t.lineas} línea(s)`,
    )
  }
  const sinEntrar = ANCHOS_DE_LA_BANDA.flatMap(({ px }) =>
    palabrasQueNoEntran(CHIVO, HERO.titular, medidaDelTitular(px), tokenPx(`--text-fluido-${nivelDelTitular()}`, px), tracking('titulo')).map((p) => `@${px} ${p}`),
  )
  afirmarIgual(sinEntrar, [], 'con la escala extendida NI UNA palabra del titular desborda su medida, en ninguno de los cuatro anchos')
  controlPositivo(
    'el detector de desbordes no está ciego: con la medida de un teléfono y el tamaño del tope, sí desbordan',
    170,
    (medida: number) => palabrasQueNoEntran(CHIVO, HERO.titular, medida, tokenPx(`--text-fluido-${nivelDelTitular()}`, TOPE_DE_LA_BANDA), tracking('titulo')).length === 0,
  )
  console.log(
    '  ⚠️ la tinta es la del titular EN UNA SOLA LÍNEA y es un PISO: sale del modelo de composición de `s10-avance.ts`, ' +
      'que mide la instancia por defecto de la variable, sin kerning y con corte por palabra. Los tres supuestos empujan ' +
      'para el mismo lado.',
  )

  // 6 · Lo que se mueve solo: la tinta de cada sección contra su alto declarado.
  titulo('8 · Lo que se mueve con la escala: la tinta de cada sección y su alto declarado')
  console.log(`  el alto de referencia de escritorio es ${ALTO_DE_ESCRITORIO} px (\`s10-referencias.ALTOS_DECLARADOS\`), y \`secciones.ts\` declara los altos en svh`)
  for (const { px } of ANCHOS_DE_LA_BANDA) {
    const tinta = tintaPorSeccion(px)
    const total = tinta.reduce((a, s) => a + s.px, 0)
    console.log(`  @${String(px).padStart(4)}  ${tinta.map((s) => `${s.seccion} ${s.px.toFixed(0)}`).join(' · ')}  ||  total ${total.toFixed(0)} px`)
  }
  for (const { px } of ANCHOS_DE_LA_BANDA) {
    const cortas = tintaPorSeccion(px)
      .map((s) => ({ ...s, caja: pantallasDeclaradasDe(s.seccion) * ALTO_DE_ESCRITORIO }))
      .filter((s) => s.px > s.caja)
    if (cortas.length === 0) continue
    console.log(
      `  ⚠️ CIFRA PUBLICADA, NO ARREGLADA [dueño: \`_lib/secciones.ts\`, que este lane NO edita porque la comparten los cuatro] — ` +
        `@${px} la TINTA sola de ${cortas.map((s) => `\`${s.seccion}\` (${s.px.toFixed(0)} px contra ${s.caja} declarados, ${(s.px / s.caja).toFixed(2)}x)`).join(' y de ')} ` +
        `pasa su alto declarado. El \`alto\` es un \`min-height\`, así que no se recorta nada: lo que se distorsiona es el RITMO —el recorrido de scroll de la sección pinneada— y la cuenta del proyecto.`,
    )
  }
}

/** Cuántas pantallas declara `secciones.ts` para una sección. */
function pantallasDeclaradasDe(id: string): number {
  const alto = SECCIONES.find((s) => s.id === id)?.alto ?? '100svh'
  return Number.parseFloat(alto) / 100
}

/**
 * §9 — LA PREMISA DE LA INSTRUCCIÓN, CONTRASTADA CONTRA LA MEDICIÓN, Y EL
 * CENSO DE FAMILIAS QUE ACOTA LA CONSECUENCIA DE HABERLA EXTENDIDO.
 */
export function afirmarLaReferencia(): void {
  titulo('9 · Qué hace la REFERENCIA arriba de 1440, y qué familia emite el documento')

  const tabla = tablaDeLaReferencia()
  afirmarIgual(tabla.length, 6, `los seis niveles fluidos de la referencia salen de \`${LAYOUT_DE_S0}\` §2.3`)
  for (const fila of tabla) {
    console.log(
      `  ${fila.token.padEnd(24)} ${[...fila.porAncho.entries()].map(([a, v]) => `${a}:${v}`).join('  ')}`,
    )
  }

  const siguenCreciendo = nivelesQueSiguenCreciendo(tabla, ANCLA_DE_LA_BANDA, TOPE_DE_LA_BANDA)
  afirmarIgual(
    siguenCreciendo,
    [],
    `⚠️ LA PREMISA DE V3-C QUEDA REFUTADA: entre ${ANCLA_DE_LA_BANDA} y ${TOPE_DE_LA_BANDA} la referencia NO crece en ninguno de los seis niveles — tiene el MISMO techo que teníamos`,
  )
  controlPositivo(
    'el detector de crecimiento no está ciego: adentro de la banda la referencia SÍ crece, en los seis',
    1024,
    (desde: number) => nivelesQueSiguenCreciendo(tabla, desde, ANCLA_DE_LA_BANDA).length === 0,
  )
  console.log(
    '  ⚠️ **DECISIÓN, NO TRANSFERENCIA.** La instrucción decía «la referencia no tiene ese techo: su tipografía sigue ' +
      'creciendo». Los 24 volcados de `raw/fluid` dicen lo contrario y el instrumento acaba de reproducirlo: a 1920 los ' +
      'seis niveles de `www.nk.studio` valen exactamente lo que valen a 1440. Extender la banda es entonces una ' +
      'decisión de develOP que se APARTA de la referencia, y queda escrita como tal en `theme-develop.css`.',
  )
  console.log(
    `  la referencia NO tiene medida la fracción de ventana de su titular: \`${LAYOUT_DE_S0}\` publica tamaños de fuente por ancho, no anchos de titular. No se estima.`,
  )

  titulo('10 · El censo de familias sobre el home compuesto — qué acota la divergencia')
  const censo = censoDeFamilias(NIVELES)
  for (const c of censo) {
    console.log(
      `  ${c.nivel.padEnd(10)} FIJA ${String(c.fija).padStart(3)} [${c.seccionesFija.join(' ')}]  ·  FLUIDA ${String(c.fluida).padStart(3)} [${c.seccionesFluida.join(' ')}]`,
    )
  }
  const conLasDos = censo.filter((c) => c.fija > 0 && c.fluida > 0).map((c) => c.nivel)
  afirmarIgual(
    conLasDos,
    [],
    'NINGÚN nivel se emite en las dos familias sobre el home compuesto: la divergencia de arriba del ancla no se ve en un solo elemento',
  )
  const fijosDeLosFluidos = censo.filter((c) => FLUIDOS.includes(c.nivel) && c.fija > 0).map((c) => c.nivel)
  afirmarIgual(fijosDeLosFluidos, [], '  y los seis niveles con contraparte fluida se emiten SIEMPRE en la fluida: cero elementos con la clase fija')
  afirmar(
    censo.some((c) => c.fija > 0),
    '  el clasificador no está clavado en «fluida»: `cuerpo` se emite fijo, que es lo que le corresponde por no tener contraparte',
    censo.filter((c) => c.fija > 0).map((c) => `${c.nivel} ${c.fija}`).join(' · '),
  )
  controlPositivo(
    'el clasificador de familia ve la clase fija cuando está puesta',
    'text-titulo-xl leading-titulo',
    (clases: string) => tokenDeCaja('titulo-xl', clases).includes('--text-fluido-'),
  )
  for (const nivel of FLUIDOS) {
    const d = divergenciaEn(nivel, TOPE_DE_LA_BANDA)
    if (d === 0) continue
    console.log(
      `  ⚠️ divergencia declarada @${TOPE_DE_LA_BANDA}: \`${nivel}\` fluido vale ${(divergenciaEn(nivel, TOPE_DE_LA_BANDA) + 0).toFixed(2)} px MÁS que su token fijo. ` +
        `Hoy no se ve —0 elementos con la clase fija—, y el disparador es el día que alguien pida ese nivel con \`fluido={false}\`: va a recibir el valor del ANCLA y no el del tope.`,
    )
  }
}
