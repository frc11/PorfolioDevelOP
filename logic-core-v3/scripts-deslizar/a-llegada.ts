/**
 * DESLIZAR-1 · FASE A — LA LLEGADA: EL DESTINO, LA LUZ Y LA VELOCIDAD DE CÁMARA.
 *
 * Instrumento de medición del sprint. **No abre el navegador**: todo lo de acá
 * sale de las funciones PURAS del árbol (`anclaje`, `recorrido`,
 * `choreographySampler`, `harness`) alimentadas con la geometría que declara
 * `secciones.ts`. Lo que sí necesita un navegador —que el ancla aterrice donde
 * esta cuenta dice— lo mide la fase B.
 *
 * Corre con `npx tsx scripts-deslizar/a-llegada.ts`.
 *
 * ── Las tres preguntas que contesta ────────────────────────────────────────
 *
 *   1. **¿Dónde frena el ancla?** `8 × ventana − scroll-padding-top`, con el 72
 *      importado de `_lib/navegacion.ts` y las 8 pantallas derivadas de
 *      `ANCLAJE.geometria`, no escritas acá.
 *   2. **¿Con qué luz se llega?** El destino cae adentro del ATARDECER, el tramo
 *      de UNA pantalla donde la luz se va de 1 a 0,04. Los 72 px del ancla caen
 *      adentro de ese tramo, así que la luz de llegada **depende de la ventana**.
 *   3. **¿A qué velocidad de cámara se llega?** En las DOS unidades, porque
 *      dicen cosas distintas y sólo una se mueve con este sprint.
 *
 * ── ⚠️ LA TRAMPA DE LA UNIDAD, DECLARADA ANTES DE LOS NÚMEROS ─────────────
 *
 * `TECHO_DE_VELOCIDAD = 1` está en **alturas de cuadro por PANTALLA DE SCROLL**.
 * Esa unidad es una propiedad de la PISTA: no tiene tiempo adentro. Un
 * deslizamiento no la puede mover ni un bit — recorre las mismas pantallas por
 * las mismas poses—, así que comparar el sprint contra el techo en esa unidad da
 * «no cambió nada» y es cierto y es inútil.
 *
 * Lo que el deslizamiento cambia es **pantallas por segundo**, y por lo tanto
 * alturas de cuadro por CUADRO. Ésa es la unidad en la que hay algo que juzgar,
 * y es la que este instrumento imprime al lado de la otra.
 */
import { ANCLAJE, pantallaDeScroll } from '../src/app/v3/_lib/escena/anclaje'
import { CHOREO_KEYFRAMES } from '../src/app/v3/_lib/escena/choreography'
import { sampleLightArc } from '../src/app/v3/_lib/escena/choreographySampler'
import type { MutableLightLevels } from '../src/app/v3/_lib/escena/choreographyTypes'
import { progresoDePantalla, progresoDelScroll } from '../src/app/v3/_lib/escena/recorrido'
import { TECHO_DE_VELOCIDAD } from '../src/app/v3/_lib/escena/techoDeVelocidad'
import { makeTrack, speedAt } from '../src/app/probe-escena/__tests__/harness'
import { BORDE_INFERIOR_EN_REPOSO_PX } from '../src/app/v3/_lib/navegacion'
import {
  CURVA_DEL_VIAJE,
  CURVA_DEL_VIAJE_EN_GSAP,
  DURACION_DEL_DESLIZAMIENTO_S,
  PRELUDIO_MS,
} from '../src/app/v3/_componentes/deslizamiento'
import { CONTENIDO } from '../src/app/v3/_secciones/hero/contenido'
import {
  CURVA_DE_LA_RUEDA,
  LINEA_DE_LA_CURVA_EN_EL_SITIO_VIVO,
  laCurvaSigueSiendoLaDelSitioVivo,
  picoDeVelocidad,
} from '../src/app/v3/_lib/__tests__/s18-curva'

/** El destino sale del `href` del CTA, que es la unica fuente que hay. */
const ID_DEL_DESTINO = CONTENIDO.cta.destino.slice(1)

const PISTA = makeTrack(CHOREO_KEYFRAMES)
const VENTANAS = [800, 900, 1080, 1200] as const
/** El reloj con el que se muestrea el deslizamiento. 60 Hz es el cuadro nominal. */
const HZ = 60

/**
 * ⚠️ DOS CURVAS, Y LA COMPARACION ES EL PUNTO DE ESTE INSTRUMENTO.
 *
 * `curva` es la del VIAJE —`power1.inOut`, importada del vocabulario— y
 * `CURVA_DE_LA_RUEDA` es la del sitio vivo, la que DESLIZAR-1 heredaba. La
 * segunda no se puede importar (`SmoothScroll.tsx` arrastra una hoja de estilos
 * y `tsx` no la puede cargar), asi que se lee del fuente y se verifica aca mismo.
 */
if (!laCurvaSigueSiendoLaDelSitioVivo()) {
  throw new Error(`la curva de la RUEDA cambio: ya no dice \`${LINEA_DE_LA_CURVA_EN_EL_SITIO_VIVO}\``)
}
const curva = CURVA_DEL_VIAJE
const DURACION_VIEJA_S = 2

function luzEn(progreso: number): MutableLightLevels {
  const salida: MutableLightLevels = { level: 0, kelvin: 0, azimuthDeg: 0, elevationDeg: 0 }
  sampleLightArc(progreso, salida)
  return salida
}

/** El borde de arriba del destino, en pantallas, derivado de la tabla. */
const destino = ANCLAJE.geometria.find((g) => g.id === ID_DEL_DESTINO)
if (destino === undefined) throw new Error(`no hay sección \`${ID_DEL_DESTINO}\` en ANCLAJE.geometria`)

console.log('DESLIZAR-1 · A — la llegada\n')
console.log(`  el documento mide ${ANCLAJE.pantallasDelDocumento} pantallas · el recorrido ${ANCLAJE.pantallasDeScroll}`)
console.log(`  \`#${ID_DEL_DESTINO}\` empieza en la pantalla ${destino.desdePantalla} y termina en la ${destino.hastaPantalla}`)
console.log(`  el ancla despeja ${BORDE_INFERIOR_EN_REPOSO_PX} px (el \`scroll-padding-top\` de /v3)`)
console.log(`  el preludio son ${PRELUDIO_MS} ms (velo + pausa) y despues arranca el recorrido`)
console.log(`  la curva del VIAJE: ${CURVA_DEL_VIAJE_EN_GSAP} · T=${DURACION_DEL_DESLIZAMIENTO_S} s · pico/media ${picoDeVelocidad(curva).pico.toFixed(4)}`)
console.log(`  la curva de la RUEDA: expoOut · pico/media ${picoDeVelocidad(CURVA_DE_LA_RUEDA).pico.toFixed(4)} — arranca a velocidad maxima`)
console.log(`  TOTAL desde el click: ${(PRELUDIO_MS + DURACION_DEL_DESLIZAMIENTO_S * 1000).toFixed(0)} ms\n`)

// ── EL REPARTO DEL CAMINO, que es lo que el dueño pidio reportar ──────────
console.log('EL REPARTO DEL CAMINO — % recorrido en cada cuarto del tiempo')
console.log('              25 %      50 %      75 %   |  el peor tramo de 700 ms')
for (const [nombre, c, T] of [
  ['VIAJE  (power1.inOut, 4,0 s)', curva, DURACION_DEL_DESLIZAMIENTO_S],
  ['RUEDA  (expoOut, 2,0 s)     ', CURVA_DE_LA_RUEDA, DURACION_VIEJA_S],
] as const) {
  // El tramo de 700 ms que mas camino se lleva: la ventana que el dueño midio.
  const ancho = 0.7 / T
  let peor = 0
  let peorEn = 0
  for (let i = 0; i <= 1000; i += 1) {
    const a = (i / 1000) * (1 - ancho)
    const trozo = c(a + ancho) - c(a)
    if (trozo > peor) {
      peor = trozo
      peorEn = a
    }
  }
  console.log(
    `  ${nombre}  ${(c(0.25) * 100).toFixed(1).padStart(6)} %  ${(c(0.5) * 100).toFixed(1).padStart(6)} %  ${(c(0.75) * 100).toFixed(1).padStart(6)} %   |  ${(peor * 100).toFixed(1).padStart(5)} % (desde t=${(peorEn * T * 1000).toFixed(0)} ms)`,
  )
}
console.log()

for (const ventana of VENTANAS) {
  const abajo = ANCLAJE.pantallasDelDocumento * ventana
  const topeDelDestino = destino.desdePantalla * ventana
  const y = topeDelDestino - BORDE_INFERIOR_EN_REPOSO_PX

  const pantallaDeLlegada = pantallaDeScroll(y, 0, abajo, ventana)
  const progresoDeLlegada = progresoDelScroll(y, 0, abajo, ventana)
  const luz = luzEn(progresoDeLlegada)

  // La misma llegada SIN el descuento del ancla, que es lo que se vería si el
  // deslizamiento frenara en el borde crudo de la sección.
  const luzSinDescuento = luzEn(progresoDelScroll(topeDelDestino, 0, abajo, ventana))

  console.log(`── VENTANA ${ventana} px ───────────────────────────────────────────`)
  console.log(`  tope de \`#${ID_DEL_DESTINO}\` = ${topeDelDestino} px   ·   el ancla frena en y = ${y} px`)
  console.log(`  distancia desde el hero = ${y} px = ${(y / ventana).toFixed(4)} pantallas`)
  console.log(`  pantalla ${pantallaDeLlegada.toFixed(4)}  ·  progreso ${progresoDeLlegada.toFixed(7)}`)
  console.log(
    `  LUZ DE LLEGADA = ${luz.level.toFixed(4)}   (elevación ${luz.elevationDeg.toFixed(2)}° · ${Math.round(luz.kelvin)} K · azimut ${luz.azimuthDeg.toFixed(2)}°)`,
  )
  console.log(`    sin el descuento del ancla la luz sería ${luzSinDescuento.level.toFixed(4)} — los ${BORDE_INFERIOR_EN_REPOSO_PX} px caen ADENTRO del atardecer`)

  // ── La cámara, cuadro a cuadro sobre el deslizamiento ───────────────────
  let picoPorCuadro = 0
  let tPicoMs = 0
  let picoPorPantalla = 0
  let picoPxPorCuadro = 0
  const cuadros = Math.round(DURACION_DEL_DESLIZAMIENTO_S * HZ)
  let anterior = 0
  for (let i = 1; i <= cuadros; i += 1) {
    const t = i / cuadros
    const yCuadro = curva(t) * y
    const dPx = yCuadro - anterior
    const dPantalla = dPx / ventana
    const progreso = progresoDelScroll(yCuadro, 0, abajo, ventana)
    // `speedAt` da alturas de cuadro por unidad de PROGRESO; la cadena de
    // unidades que sigue es la que `s13b-soporte.ts` ya usa.
    const fhPorProgreso = speedAt(PISTA, progreso)
    const dProgreso = progreso - progresoDelScroll(anterior, 0, abajo, ventana)
    const fhEsteCuadro = fhPorProgreso * dProgreso
    const fhPorPantallaAca = dPantalla > 0 ? fhEsteCuadro / dPantalla : 0
    if (fhEsteCuadro > picoPorCuadro) {
      picoPorCuadro = fhEsteCuadro
      tPicoMs = (t * DURACION_DEL_DESLIZAMIENTO_S * 1000)
    }
    if (fhPorPantallaAca > picoPorPantalla) picoPorPantalla = fhPorPantallaAca
    if (dPx > picoPxPorCuadro) picoPxPorCuadro = dPx
    anterior = yCuadro
  }
  console.log(`  CÁMARA · pico ${picoPorCuadro.toFixed(4)} alturas de cuadro POR CUADRO (a los ${tPicoMs.toFixed(0)} ms del arranque del recorrido)`)
  console.log(`           = ${(picoPorCuadro * HZ).toFixed(2)} alturas de cuadro por segundo a ${HZ} Hz`)
  console.log(`           pico ${picoPorPantalla.toFixed(4)} alturas de cuadro POR PANTALLA DE SCROLL (techo declarado: ${TECHO_DE_VELOCIDAD})`)
  console.log(`           el scroll salta hasta ${picoPxPorCuadro.toFixed(1)} px por cuadro = ${(picoPxPorCuadro / ventana).toFixed(4)} pantallas`)

  /**
   * LA VARA DEL GESTO NORMAL, para que el numero de arriba signifique algo.
   *
   * Un diente de rueda son ~100 px, y Lenis los anima con la MISMA curva y su
   * propia duracion (`OPCIONES_DE_LENIS.duration`). La velocidad pico de la
   * curva es su derivada en t=0, que para esta familia vale 10 ln 2 = 6,9315.
   */
  const DIENTE_DE_RUEDA_PX = 100
  const DURACION_DEL_SITIO_VIVO_S = 1.1
  const DERIVADA_EN_CERO = 10 * Math.LN2
  const pxPorCuadroDelGesto = (DERIVADA_EN_CERO * DIENTE_DE_RUEDA_PX) / DURACION_DEL_SITIO_VIVO_S / HZ
  console.log(
    `  VARA · un diente de rueda (${DIENTE_DE_RUEDA_PX} px en ${DURACION_DEL_SITIO_VIVO_S} s) pica a ${pxPorCuadroDelGesto.toFixed(1)} px/cuadro` +
      ` — el deslizamiento pica ${(picoPxPorCuadro / pxPorCuadroDelGesto).toFixed(1)} veces mas rapido`,
  )

  /**
   * EL ATERRIZAJE — que fraccion del viewport ocupa `#trabajos` al frenar.
   *
   * Al parar, el viewport abarca [y, y + ventana] y la seccion abarca
   * [tope, tope + alto]. La interseccion es [tope, y + ventana], o sea
   * `ventana - 72`: los 72 px de arriba son el despeje del ancla, y ahi es donde
   * vive la pastilla. Es derivado de la tabla; la fase C lo mide en el navegador.
   */
  const alturaVisibleDeLaSeccion = ventana - BORDE_INFERIOR_EN_REPOSO_PX
  console.log(
    `  ATERRIZAJE · \`#${ID_DEL_DESTINO}\` ocupa ${alturaVisibleDeLaSeccion} de ${ventana} px = ${((alturaVisibleDeLaSeccion / ventana) * 100).toFixed(1)} % del viewport` +
      `  ·  los ${BORDE_INFERIOR_EN_REPOSO_PX} px de arriba son el despeje del ancla, donde vive la pastilla`,
  )

  // El progreso recorrido y los tramos que cruza.
  console.log(`  la escena va del progreso 0 al ${progresoDeLlegada.toFixed(4)} — cruza los nudos en ${progresoDePantalla(1).toFixed(3)} · ${progresoDePantalla(4).toFixed(3)}`)
  console.log()
}
