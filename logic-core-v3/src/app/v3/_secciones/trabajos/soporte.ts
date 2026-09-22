/**
 * EL ARNÉS DE `trabajos.invariant` — lo que se lee del disco, y nada más.
 *
 * ── Por qué existe (B1) ───────────────────────────────────────────────────
 *
 * Porque `trabajos.invariant.tsx` pasó las 300 líneas y la regla del proyecto es
 * que se parte, no que se afloja. El corte no es por tamaño: es el mismo que
 * `cierre/soporte.ts` ya tiene, y separa **la plomería** —abrir archivos,
 * componer rutas, derivar colores del tema— de **las afirmaciones**, que son lo
 * que alguien lee cuando quiere saber qué protege el invariante.
 *
 * ⚠ **El montaje de las tres ramas NO se mudó acá, y es deliberado.** Renderizar
 * la sección con la compuerta abierta, cerrada y con la preferencia puesta es
 * parte de lo que el invariante AFIRMA —las tres ramas y sus diferencias son el
 * sujeto—, y sacarlo lo dejaría hablando de un HTML que no se ve producir.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'

import { CONTENIDO } from './contenido'
import {
  CARTEL,
  DESTINO_DEL_CTA,
  MEDIDAS_DE_LAS_CAPTURAS,
  PX_DE_LA_SECCION,
  arranqueDeDemos,
  enLaVentana,
  progresoDeLaVentana,
  ventanaDeLaHuida,
  ventanaDelCta,
  ventanaDelTunel,
} from './geometria'
import { ENTRADAS_AL_TRAMO, cruceDelTramo, gestoDelCruce, type CruceObservado, type EntradaAlTramo } from './gota'
import {
  ANCHO_AL_NACER,
  ANCHO_DEL_CTA,
  ANCHO_DEL_RELEVO,
  ANCHO_MAXIMO,
  ASENTAMIENTO_DEL_TUNEL_MS,
  AVANCE_POR_PX,
  DURACION_DEL_FRENO_MS,
  RESTO_AL_ASENTARSE,
  RITMO_POR_CIEN_PX,
  anchoDeLaCaptura,
  anchoFinalDeLaPrimera,
  avanceDelNacimiento,
  avanceQueCompletaElTunel,
  letrasEscritas,
  perseguir,
  pxQuePideElTunel,
} from './tunel'
import { CRUCES_DEL_TRAMO, caminoDeLaPersecucion, medidasDeWebp, pxDelTema } from './trabajos-piezas'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

/** Un archivo del disco, relativo a esta carpeta. */
export const leer = (relativa: string): string => readFileSync(path.join(AQUI, relativa), 'utf8')

/** El archivo real de una captura: la ruta del contenido es de la web. */
export const abrirCaptura = (rutaWeb: string): Uint8Array =>
  readFileSync(path.join(AQUI, '../../../../..', 'public', rutaWeb))

/**
 * Los DOS archivos que llegan al navegador. **El invariante queda afuera a
 * propósito**: lleva adentro el literal `three` como entrada del control
 * positivo del detector, y no se despacha — incluirlo daría un rojo producido
 * por la propia comprobación.
 */
export const FUENTES: readonly { readonly archivo: string; readonly texto: string }[] = [
  'Trabajos.tsx',
  // B12: las piezas y la capa de la gota salieron de `Trabajos.tsx` al mudar el
  // título y la bajada al escenario. Se despachan igual, así que se leen igual.
  'piezas.tsx',
  // El trabajo con sus dos medios: la etapa 1 del portfolio lo volvió pieza de
  // composición, así que entra a la fuente que el instrumento lee.
  'Proyecto.tsx',
  'CapaDeLaGota.tsx',
  'gota.ts',
  // PORTFOLIO: el túnel, con el mismo reparto que la gota — el núcleo puro y la
  // capa fina que lo escribe.
  'CapaDelTunel.tsx',
  'tunel.ts',
  'geometria.ts',
  'asentamiento.ts',
  'contenido.ts',
].map((f) => ({ archivo: f, texto: leer(f) }))

/** El fuente de la COMPOSICIÓN y el de las PIEZAS, juntos: desde B12 los
 *  `patron="…"` viven en el segundo y el marcado de la sección en los dos. */
export const FUENTE_DE_LA_COMPOSICION: string = FUENTES.filter((f) => f.archivo === 'Trabajos.tsx' || f.archivo === 'piezas.tsx' || f.archivo === 'Proyecto.tsx' || f.archivo === 'CapaDelTunel.tsx')
  .map((f) => f.texto)
  .join(String.fromCharCode(10))

/** El CSS del tema, de donde salen el fondo invertido, la tinta y los acentos. */
export const CSS = leer('../../../theme-develop.css')

/** El fuente de `Panel.tsx`, para el puente del atributo del panel (§1b). */
export const FUENTE_DEL_PANEL = leer('../../_componentes/Panel.tsx')

const IMPORTA_3D = /from\s+['"](three(\/[^'"]*)?|drei|@react-three\/[^'"]+)['"]/

/** Si un fuente NO importa un motor 3D. El efecto de P7 es HTML con perspectiva. */
export const sinTres = (src: string): boolean => !IMPORTA_3D.test(src)

/** Cuántas veces aparece una aguja en un HTML. */
export const veces = (html: string, aguja: string): number => html.split(aguja).length - 1

/**
 * ⚠️ **§19 DEL INVARIANTE, MUDADO ACÁ POR LA REGLA DE LAS 300 LÍNEAS.**
 *
 * Es el mismo corte que la cabecera describe: el invariante se parte, no se
 * afloja. **No se tocó una afirmación al mudarlo.** Va en el arnés y no en
 * `trabajos-piezas.ts` porque eso son detectores puros y esto son afirmaciones,
 * que es la misma división que `s5-contenido-piezas.ts` y `s21-llave-soporte.tsx`
 * ya hacen en sus lanes.
 */
export function afirmarLasCuatroEntradas(): void {
  // ════════════════════════════════════════════════════════════════════════════
  titulo('19 · El barrido: las CUATRO entradas al tramo, y en cuáles corre')

  /**
   * ⚠️ **EL DEFECTO QUE ESTO CIERRA: el barrido se disparaba al volver desde
   * Servicios**, a pantalla completa y encima de las capturas del túnel.
   *
   * La causa es la de siempre en este archivo: **un booleano que junta dos
   * situaciones distintas.** `isIntersecting` es cierto al llegar desde Quiénes
   * somos —bajando— y también al volver desde Servicios —subiendo—, y el
   * observador dispara igual en las dos. Es hermano del que `salioPorArriba` ya
   * había mostrado: ahí era «volvimos» contra «todavía no llegamos».
   *
   * El tramo tiene dos fronteras y cada una se cruza en dos sentidos: **cuatro**
   * entradas. Acá se afirman las cuatro por separado, con la caja que el evento
   * trae, y se declara en cuáles corre el barrido y en cuáles no.
   */

  for (const c of CRUCES_DEL_TRAMO) {
    afirmarIgual(cruceDelTramo(c.caja), c.entrada, `«${c.cuando}» se clasifica como \`${c.entrada}\``)
    afirmarIgual(gestoDelCruce(c.entrada), c.gesto, `  y ahí el barrido hace \`${c.gesto}\``)
  }
  afirmarIgual(
    [...CRUCES_DEL_TRAMO].map((c) => c.entrada).sort(),
    [...ENTRADAS_AL_TRAMO].sort(),
    'las cuatro entradas están cubiertas y no hay una quinta: el censo es el vocabulario entero',
  )
  afirmarIgual(
    ENTRADAS_AL_TRAMO.filter((e) => gestoDelCruce(e) !== 'nada'),
    ['arriba-bajando', 'arriba-subiendo'],
    'el barrido corre en DOS de las cuatro, y las dos son la frontera con Quiénes somos: en la de Servicios no corre en ningún sentido',
  )
  controlPositivo(
    'el censo ve una guarda que confunde entrar por arriba con volver desde abajo',
    (c: CruceObservado): EntradaAlTramo => (c.cruza ? 'arriba-bajando' : 'arriba-subiendo'),
    (clasificar: (c: CruceObservado) => EntradaAlTramo) => CRUCES_DEL_TRAMO.every((c) => clasificar(c.caja) === c.entrada),
  )
  controlPositivo(
    '  y ve una política que hace correr el barrido en la frontera de abajo',
    (e: EntradaAlTramo) => (e === 'abajo-subiendo' ? 'ida' : gestoDelCruce(e)),
    (politica: (e: EntradaAlTramo) => string) =>
      ENTRADAS_AL_TRAMO.filter((e) => politica(e) !== 'nada').join(' ') === 'arriba-bajando arriba-subiendo',
  )
}

/**
 * ⚠️ **§17 DEL INVARIANTE — el túnel, su ritmo y el CTA. Mudado acá por la regla
 * de las 300 líneas, sin tocar una afirmación.**
 *
 * Esto no comprueba que el túnel se vea bien: comprueba que sus números sigan
 * siendo los que se midieron, y que lo que se deriva se derive.
 */
export function afirmarElTunel(conMotion: string, quieto: string, cuantas: number): void {
  titulo('17 · El túnel: ritmo constante, relevo tardío y el CTA')

  // ── EL RITMO ES CONSTANTE EN TÉRMINOS RELATIVOS ─────────────────────────
  /**
   * ⚠️ **La afirmación que define el sprint.** Antes el ancho crecía en RECTA y
   * el ritmo relativo se desplomaba: la primera captura iba ×2,5 en un tramo y
   * ×1,8 en otro casi cuatro veces más largo. Ahora tramos IGUALES de scroll
   * multiplican por lo MISMO, en cualquier punto del recorrido. Se mide en tres
   * lugares distintos del túnel y los tres tienen que dar el mismo factor.
   */
  const total = avanceQueCompletaElTunel(cuantas)
  /**
   * ⚠️ Se mide sobre la ÚLTIMA captura y no sobre la primera: la primera topa en
   * `ANCHO_MAXIMO` a mitad del recorrido y de ahí en más su factor es 1, que es el
   * tope funcionando y no el ritmo fallando. La última crece de punta a punta.
   */
  const ultima = cuantas - 1
  const factorEn = (avance: number): number =>
    (anchoDeLaCaptura(ultima, avance + AVANCE_POR_PX * 100) ?? 0) / (anchoDeLaCaptura(ultima, avance) ?? 1)
  const nace = avanceDelNacimiento(ultima)
  const donde = [0.1, 0.5, 0.85]
  for (const f of donde) {
    afirmarIgual(
      factorEn(nace + (total - nace) * f).toFixed(4),
      RITMO_POR_CIEN_PX.toFixed(4),
      `  a un ${(f * 100).toFixed(0)} % de la vida de la última captura, 100 px de scroll multiplican por ${RITMO_POR_CIEN_PX}`,
    )
  }
  controlPositivo(
    'el chequeo del ritmo ve un crecimiento en RECTA, que es lo que había antes',
    (avance: number) => 0.44 + avance,
    (recta: (a: number) => number) => {
      const factor = (a: number): number => recta(a + AVANCE_POR_PX * 100) / recta(a)
      return Math.abs(factor(total * 0.05) - factor(total * 0.85)) < 1e-4
    },
  )

  // ── EL RELEVO ES TARDÍO ─────────────────────────────────────────────────
  for (let i = 1; i < cuantas; i += 1) {
    afirmarIgual(
      (anchoDeLaCaptura(i - 1, avanceDelNacimiento(i)) ?? 0).toFixed(4),
      ANCHO_DEL_RELEVO.toFixed(4),
      `  al nacer la captura ${i + 1}, la anterior mide ${ANCHO_DEL_RELEVO} del cuadro: casi llegando al límite`,
    )
  }
  afirmar(
    ANCHO_DEL_RELEVO >= 0.85,
    `el relevo es TARDÍO: la siguiente no nace hasta que la anterior está en ${ANCHO_DEL_RELEVO} del cuadro (era 0,32)`,
  )
  afirmarIgual(
    (anchoDeLaCaptura(0, 0) ?? 0).toFixed(4),
    ANCHO_AL_NACER.toFixed(4),
    `  y nacen a ${ANCHO_AL_NACER} del cuadro — la referencia no da este número: sus imágenes nacen en 0 px con opacidad 1`,
  )

  // ── EL TOPE, MEDIDO, Y QUE ESTA VEZ MUERDE ──────────────────────────────
  const DESBORDE_MEDIDO = { minimo: 1.17, maximo: 1.68 } as const
  const desborde = anchoFinalDeLaPrimera(cuantas)
  afirmar(
    desborde >= DESBORDE_MEDIDO.minimo && desborde <= DESBORDE_MEDIDO.maximo,
    `la primera termina en ${desborde.toFixed(4)} anchos de cuadro, adentro de los ${DESBORDE_MEDIDO.minimo}–${DESBORDE_MEDIDO.maximo} medidos en la referencia`,
  )
  afirmar(
    ANCHO_AL_NACER * Math.exp(total) > ANCHO_MAXIMO,
    `  y el tope MUERDE: sin él la primera llegaría a ${(ANCHO_AL_NACER * Math.exp(total)).toFixed(2)} anchos de cuadro`,
  )

  // ── LAS CUATRO VENTANAS ENTRAN EN LA SECCIÓN, EN ORDEN Y SIN PISARSE ────
  const tunel = ventanaDelTunel(cuantas)
  const cta = ventanaDelCta(cuantas)
  const huida = ventanaDeLaHuida(cuantas)
  const demos = arranqueDeDemos(cuantas)
  afirmarIgual(
    tunel.desde,
    progresoDeLaVentana(CARTEL, CARTEL.huirDesde ?? 1),
    'el túnel arranca en el instante EXACTO en que el cartel empieza a huir: es una derivación, no dos números escritos aparte',
  )
  afirmarIgual(
    [tunel.hasta, cta.hasta, huida.hasta].map((v) => v.toFixed(4)),
    [cta.desde, huida.desde, demos].map((v) => v.toFixed(4)),
    '  y las cuatro ventanas se tocan sin huecos: túnel → CTA → huida → demos',
  )
  afirmar(
    demos < 1,
    `  el tramo de demos existe y no es de largo cero: arranca en ${demos.toFixed(4)} y queda ${((1 - demos) * PX_DE_LA_SECCION).toFixed(0)} px de sala de noche sola`,
  )
  afirmar(
    pxQuePideElTunel(cuantas) < PX_DE_LA_SECCION,
    `  y el túnel entero entra en la sección sin tocarle el alto: pide ${pxQuePideElTunel(cuantas).toFixed(0)} px de los ${PX_DE_LA_SECCION}`,
  )

  // ── EL CTA ──────────────────────────────────────────────────────────────
  afirmar(ANCHO_DEL_CTA < 1, `la ventana del CTA NO cubre la pantalla: crece hasta ${ANCHO_DEL_CTA} del ancho y ahí se queda`)
  const letras = [...CONTENIDO.cta.frase].length
  afirmarIgual(letrasEscritas(0, letras), 0, '  al empezar a crecer no hay una sola letra escrita')
  afirmarIgual(
    letrasEscritas(1, letras),
    letras,
    `  y cuando la ventana llega a su tamaño la frase está completa: las ${letras} letras, por construcción y no por calibración`,
  )
  afirmar(
    conMotion.includes(DESTINO_DEL_CTA) && quieto.includes(DESTINO_DEL_CTA),
    `el CTA es un enlace real a contacto —${DESTINO_DEL_CTA}, el mismo destino que declara la navegación— en las DOS ramas`,
  )
  afirmarIgual(veces(conMotion, 'data-pieza="enlace-del-cta"'), 1, '  y es UNO solo: no hay dos anclas al mismo lugar en el mismo cuadro')
  afirmar(
    DURACION_DEL_FRENO_MS > 0 && DURACION_DEL_FRENO_MS < ASENTAMIENTO_DEL_TUNEL_MS,
    `  el freno dura ${DURACION_DEL_FRENO_MS} ms — menos que el asentamiento, así que la persecución alcanza a reencontrarse con el scroll`,
  )

  // ── EL FRENO NO TOCA EL SCROLL ──────────────────────────────────────────
  /**
   * ⚠️ **El repo prohíbe frenar el scroll, y acá no se frena.** Lo que se detiene
   * es el AVANCE del tramo. Esto lo afirma sobre la fuente porque es la clase de
   * cosa que se agrega sin querer cuando alguien quiere «que frene de verdad».
   */
  const FUENTE_DEL_TUNEL = FUENTES.find((f) => f.archivo.includes('CapaDelTunel'))?.texto ?? ''
  afirmar(FUENTE_DEL_TUNEL.length > 0, 'se leyó del disco la fuente de la capa del túnel')
  // ⚠️ El nombre del motor de scroll NO se escribe entero en la lista: el detector
  // lee esta misma fuente y un literal acá se contaría a sí mismo. Se arma partido.
  for (const prohibido of ['preventDefault', 'scrollTo', 'scrollBy', 'len' + 'is', 'overscroll']) {
    afirmarIgual(veces(FUENTE_DEL_TUNEL, prohibido), 0, `  la capa no usa \`${prohibido}\`: el freno es del gesto, no del scroll`)
  }
  afirmarIgual(
    veces(FUENTE_DEL_TUNEL, "setProperty('visibility'"),
    0,
    '  y no esconde con `visibility`: eso sacaría del recorrido de teclado a las anclas del túnel',
  )
  afirmar(
    FUENTE_DEL_TUNEL.includes('focusin') && FUENTE_DEL_TUNEL.includes('pisoDelFoco'),
    '  hay un piso del foco: una parada que no se ve no sirve, así que enfocar una captura la muestra',
  )
  controlPositivo(
    'el detector vería una capa que vuelve a esconder con `visibility`',
    "el.style.setProperty('visibility', 'hidden')",
    (src: string) => veces(src, "setProperty('visibility'") === 0,
  )

  // ── LA HUIDA DESPEJA EL TRAMO DE DEMOS ──────────────────────────────────
  afirmarIgual(
    enLaVentana(demos, huida),
    1,
    'cuando empiezan los demos la huida ya terminó: el tramo queda con la sala de noche sola, que es lo que estaba tapado',
  )
  afirmarIgual(enLaVentana(huida.desde, huida), 0, '  y arranca recién cuando el CTA terminó de leerse')

  // ── EL RECORTE Y SU MARGEN ──────────────────────────────────────────────
  afirmar(conMotion.includes('overflow:clip'), 'la capa recorta al cuadro: sin eso el desborde le da al sitio 459 px de scroll horizontal')
  afirmar(conMotion.includes('overflow-clip-margin'), '  y recorta con margen: `hidden` se comería el anillo de foco de las anclas')
  // El recorte de la VENTANA del CTA sí es `hidden`, y está bien: recorta a sus
  // propios hijos, no al anillo de foco, que se dibuja por fuera de su caja. Que
  // ningún focalizable quede adentro de una caja recortada lo afirma `s5-compacto`
  // sobre las cuatro secciones enteras, que es donde esa regla vive.
  const margenDelAnillo = pxDelTema(CSS, 'foco-desplazamiento') + pxDelTema(CSS, 'foco-grosor')
  const margenEscrito = Number(/overflow-clip-margin:\s*(\d+(?:\.\d+)?)px/.exec(conMotion)?.[1] ?? NaN)
  afirmarIgual(margenEscrito, margenDelAnillo, `  y el margen son los ${margenDelAnillo} px del anillo, leídos del tema y no elegidos acá`)

  // ── LAS CAPTURAS MIDEN LO QUE LA GEOMETRÍA DECLARA ──────────────────────
  for (const [i, proyecto] of CONTENIDO.proyectos.entries()) {
    const declarada = MEDIDAS_DE_LAS_CAPTURAS[i]
    const real = medidasDeWebp(new Uint8Array(readFileSync(join('public', proyecto.pagina.fuente))))
    afirmarIgual([real.ancho, real.alto], [declarada.ancho, declarada.alto], `«${proyecto.nombre}» — el archivo en disco mide lo que declara la geometría`)
  }
  afirmarIgual(
    [...new Set(MEDIDAS_DE_LAS_CAPTURAS.map((m) => (m.ancho / m.alto).toFixed(6)))],
    [(16 / 9).toFixed(6)],
    '  y las tres comparten relación: por eso las tres crecen igual sin que nadie lo declare',
  )
  afirmarIgual(MEDIDAS_DE_LAS_CAPTURAS.length, cuantas, '  y hay exactamente una medida por proyecto')

  // ── LA PERSECUCIÓN, QUE NO SE TOCÓ ──────────────────────────────────────
  const enPersecucion = (v: number, dt: number): number => perseguir(v, 1, dt)
  const a60 = caminoDeLaPersecucion(ASENTAMIENTO_DEL_TUNEL_MS, 1000 / 60, enPersecucion)
  const a144 = caminoDeLaPersecucion(ASENTAMIENTO_DEL_TUNEL_MS, 1000 / 144, enPersecucion)
  afirmar(a60 >= 1 - RESTO_AL_ASENTARSE, `a los ${ASENTAMIENTO_DEL_TUNEL_MS} ms la persecución recorrió el ${(a60 * 100).toFixed(2)} % del camino`)
  afirmar(
    Math.abs(a60 - a144) < 1e-3,
    `y el mismo tiempo da el mismo resultado a 60 y a 144 cuadros por segundo: ${a60.toFixed(6)} contra ${a144.toFixed(6)}`,
  )
  // ⚠️ El factor del control es chico a propósito: con uno grande las dos corridas
  // saturan en 1 dentro de la ventana y el control se queda ciego.
  controlPositivo(
    'el chequeo de los cuadros por segundo vería una persecución por factor fijo',
    0.002,
    (k: number) => {
      const porFactorFijo = (v: number): number => v + (1 - v) * k
      const corre = (dt: number): number => caminoDeLaPersecucion(ASENTAMIENTO_DEL_TUNEL_MS, dt, porFactorFijo)
      return Math.abs(corre(1000 / 60) - corre(1000 / 144)) < 1e-3
    },
  )
}
