/**
 * EL RECORRIDO DEL ENCUADRE, ventana por ventana y cámara por cámara — lo que
 * el §7 de `s10-logo.invariant.ts` afirma y publica.
 *
 * ⚠ **Este archivo NO se escanea por tokens.** Igual que sus vecinos: sus
 * números son unidades de mundo, relaciones de aspecto y coordenadas de cuadro.
 *
 * ── Por qué es un archivo y no diez líneas en el invariante ────────────────
 *
 * Porque el §7 pasó de publicar un defecto a custodiar un arreglo, y eso son
 * dos cámaras × cuatro ventanas × dos fórmulas. Con las derivaciones adentro,
 * el invariante se iba de las 300 líneas del repo — y la costura es la misma
 * que ya separa a `s10-logo.ts` (muestrea) de `s10-logo-lectura.ts` (lee): acá
 * se DERIVA, allá se afirma.
 *
 * ── LAS DOS CÁMARAS, y por qué las dos ────────────────────────────────────
 *
 * §7.15: el arnés declara la caja del logo como 7,168 × 7,168 y el rig le pasa
 * el mesh medido en runtime, 6,863 × 4,779. El recorrido del encuadre depende
 * de esa medida, así que **el defecto 14 y su arreglo tienen dos números, no
 * uno**, y afirmarlo sobre una sola cámara dejaría a la otra sin custodia.
 */

import { FUENTE_TITULO, lineasDeTexto } from '../../__tests__/s10-avance'
import { tokenPx } from '../../__tests__/s10-css'
import { leerAvancesDe } from '../../__tests__/s10-woff2'
import { SCENE_LOGO_MESH_WORLD } from '@/lib/scene-camera'
import {
  FRAME_TRAVEL_SAFETY,
  LOGO_W,
  TAN_HALF_V,
  cameraAt,
  emptyPose,
  makeTrack,
  type Track,
} from '@/app/probe-escena/__tests__/harness'
import { recorridoDeEncuadre } from '../encuadre'
import { CHOREO_KEYFRAMES } from '../choreography'
import { camaraEnCuadro, mismaCamara, recorridoConCodo } from './camaraDelCuadro'
import { aCuadroX } from './s10-logo-cajas'
import type { TablaDeSuperposicion } from './s10-logo-tablas'
import {
  VENTANAS,
  cajaDelLogo,
  cobertura,
  conPose,
  fraccionDentro,
  mayorCaja,
  muestra,
  type Ventana,
} from './s10-logo-lectura'

/** Una cámara del repo, nombrada por su caja de logo. Las dos se miden. */
export interface Camara {
  readonly id: string
  readonly anchoDeLaCaja: number
}

export const CAMARAS: readonly Camara[] = [
  { id: 'arnés', anchoDeLaCaja: LOGO_W },
  { id: 'rig', anchoDeLaCaja: SCENE_LOGO_MESH_WORLD.width },
]

/** La distancia ojo-objeto de un keyframe. Es lo que fija el tamaño del cuadro. */
function distanciaAlOjo(nombreDelKeyframe: string): number {
  const k = CHOREO_KEYFRAMES.find((f) => f.name === nombreDelKeyframe)
  if (k === undefined) throw new Error(`keyframe desconocido: ${nombreDelKeyframe}`)
  return Math.hypot(k.pose.distance, k.pose.height)
}

/**
 * EL ASPECTO DONDE EL RECORRIDO SE ANULA — antes «el codo», ahora un punto.
 *
 * Es el aspecto en el que la caja del logo mide exactamente el ancho del
 * cuadro: ahí no hay a dónde correrla, ni desde adentro ni desde afuera. Con la
 * fórmula vieja —`max(0, …)`— **todo aspecto por debajo de este número daba
 * cero también**, y eso era el defecto 14: una semirrecta de perilla muerta. Con
 * `recorridoDeEncuadre` el cero es sólo este aspecto, y la función es continua a
 * los dos lados.
 */
export function aspectoDeRecorridoNulo(nombreDelKeyframe: string, anchoDeLaCaja: number): number {
  return anchoDeLaCaja / 2 / (TAN_HALF_V * distanciaAlOjo(nombreDelKeyframe))
}

export interface RecorridoMedido {
  readonly ventana: Ventana
  /** Medio ancho del cuadro en unidades de mundo, a la distancia de esa pose. */
  readonly medioAncho: number
  /** Lo que devolvía la fórmula con el codo. Se conserva para el antes/después. */
  readonly conCodo: number
  /** Lo que devuelve la fórmula corregida. */
  readonly corregido: number
  /** Cuánto corre el logo con `frameX = 1`, en coordenada de cuadro (−1…1). */
  readonly enCuadro: number
}

/** El recorrido de una pose en las cuatro ventanas, con las dos fórmulas al lado. */
export function recorridosDe(nombreDelKeyframe: string, anchoDeLaCaja: number): RecorridoMedido[] {
  const medioAlto = TAN_HALF_V * distanciaAlOjo(nombreDelKeyframe)
  return VENTANAS.map((ventana) => {
    const medioAncho = medioAlto * ventana.aspecto
    const corregido = recorridoDeEncuadre(medioAncho, anchoDeLaCaja)
    return {
      ventana,
      medioAncho,
      conCodo: recorridoConCodo(medioAncho, anchoDeLaCaja),
      corregido,
      enCuadro: corregido / medioAncho,
    }
  })
}

/**
 * EL MÁXIMO DE `|frameY|` EN TODO EL RECORRIDO — la comprobación que hace que
 * arreglar el eje vertical sea un no-op y no una apuesta.
 *
 * `choreography.ts` declara `frameY: 0` en los ocho keyframes, pero lo que
 * importa no es lo que declara: es lo que el muestreo devuelve entre keyframe y
 * keyframe. Se barre el recorrido entero y se publica el máximo.
 */
export function frameYMaximo(pista: Track, pasos = 2000): number {
  const pose = emptyPose()
  let maximo = 0
  for (let i = 0; i <= pasos; i += 1) {
    cameraAt(pista, i / pasos, 16 / 9, pose)
    if (Math.abs(pose.frameY) > maximo) maximo = Math.abs(pose.frameY)
  }
  return maximo
}

/**
 * LAS PALANCAS DE COMPOSICIÓN, con su número — el párrafo que el §7 imprime.
 *
 * ⚠ **Ninguna se aplica.** Son las salidas que quedan abiertas para el defecto
 * 7 —la superposición del logo con el titular del diferencial, que el arreglo
 * del defecto 14 NO cerró—, y cuál se toma es decisión del humano. Se recalculan
 * en cada corrida sobre la escena de hoy en vez de quedar escritas: una palanca
 * con un número viejo es una palanca que ya no se puede usar.
 *
 * La quinta —`FRAME_TRAVEL_SAFETY`— cambió de sentido con el arreglo y por eso
 * se escribe distinto: **antes no tocaba el caso encontrado**, porque el codo ya
 * dejaba el recorrido en cero y multiplicar cero por 1,136 sigue siendo cero.
 * Ahora sí lo toca, en las cuatro ventanas.
 */
export function palancasDeComposicion(masAngosto: Ventana): readonly string[] {
  const cajaDelHero = mayorCaja('hero', masAngosto.ancho)
  const derechaDelHero = aCuadroX(cajaDelHero.banda.izquierda + cajaDelHero.banda.ancho, masAngosto.ancho)
  const bordes = [0.8, 0.9, 1].map((fx) => {
    const c = cajaDelLogo(conPose('hero', { frameX: fx }, 0, masAngosto.aspecto))
    return `${fx}→${(c?.x0 ?? Number.NaN).toFixed(3)}`
  })
  const distancias = [11, 13, 15].map((d) => {
    const m = conPose('demos', { distance: d }, 0.75, masAngosto.aspecto)
    return `${d}→${(fraccionDentro(m) * 100).toFixed(1)}% dentro / ${(cobertura(m) * 100).toFixed(1)}% del cuadro`
  })
  const canal = tokenPx('--grilla-canal-amplio', masAngosto.ancho)
  const anchoDeDos = (2 * (cajaDelHero.banda.ancho - 2 * canal)) / 3 + canal
  const lineasDeDos = lineasDeTexto(
    leerAvancesDe(FUENTE_TITULO),
    cajaDelHero.texto,
    anchoDeDos,
    cajaDelHero.tamanoPx,
    cajaDelHero.interletradoEm,
  )
  const conSeguridadEnUno = recorridosDe('demos', LOGO_W).map(
    (r) => `${r.ventana.etiqueta}→${((r.enCuadro / FRAME_TRAVEL_SAFETY - r.enCuadro) * 100).toFixed(2)}%`,
  )
  return [
    `PALANCA \`frameX\` del Hero (hoy ${CHOREO_KEYFRAMES[0].pose.frameX}): el borde IZQUIERDO del logo va ${bordes.join(' · ')} y la ` +
      `columna de texto termina en ${derechaDelHero.toFixed(3)} → ni en el tope de 1 libera la columna · costo: mueve el ` +
      'destino del preloader (`scene-framing.ts` proyecta ESTE keyframe) y toca la perilla abierta de §7.1',
    `PALANCA distancia de \`demos\` (hoy ${CHOREO_KEYFRAMES.find((k) => k.name === 'demos')?.pose.distance}): ${distancias.join(' · ')}` +
      ' · costo: rompe «el momento más íntimo» (§2.2) y la condición `altura ≤ −0,214 × distancia` que pone el sol en cuadro',
    'PALANCA medida del titular del Hero (3 de 5 columnas, `GEOMETRIA.columnasDeLaMedida`) → 2 de 5: la columna pasa de ' +
      `${cajaDelHero.banda.ancho.toFixed(0)} a ${anchoDeDos.toFixed(0)}px y su borde derecho de ${derechaDelHero.toFixed(3)} a ` +
      `${aCuadroX(cajaDelHero.banda.izquierda + anchoDeDos, masAngosto.ancho).toFixed(3)} · costo: el titular pasa de ${cajaDelHero.lineas} a ${lineasDeDos} líneas`,
    `PALANCA dónde cae la sección en el progreso: a p=0,875 el logo ocupa ${(cobertura(muestra(0.875, masAngosto.aspecto)) * 100).toFixed(1)}% del cuadro ` +
      `contra el ${(cobertura(muestra(0.75, masAngosto.aspecto)) * 100).toFixed(1)}% de p=0,750 · costo: correr el diferencial hacia adelante lo lleva contra ` +
      'el cruce de AA del FONDO (p=0,878, §7.29) y contra el anclaje entero de SITIO-S9. La más cara.',
    `PALANCA \`FRAME_TRAVEL_SAFETY\` = ${FRAME_TRAVEL_SAFETY} → 1: corre el logo ${conSeguridadEnUno.join(' · ')} más de cuadro en la pose ` +
      'de `demos`. ⚠ Antes de SITIO-S11 esta palanca daba CERO en el cuadro más alto, porque el codo ya había anulado el ' +
      'recorrido y 1,136 × 0 sigue siendo 0. Con el codo sacado, mueve en las cuatro.',
  ]
}

// ── LO QUE EL §7 AFIRMA, ya derivado ────────────────────────────────────────

/**
 * EL CUADRO MÁS ALTO de los cuatro —1025×900, aspecto 1,139— que es el que el
 * codo dejaba sin perilla en las dos cámaras. Sale de `VENTANAS`, no se escribe.
 */
export const MAS_ANGOSTO: Ventana = VENTANAS.reduce((a, b) => (b.aspecto < a.aspecto ? b : a))

/** Los ocho recorridos de `demos`: dos cámaras × cuatro cuadros. */
export const RECORRIDOS: readonly { readonly camara: Camara; readonly filas: readonly RecorridoMedido[] }[] =
  CAMARAS.map((camara) => ({ camara, filas: recorridosDe('demos', camara.anchoDeLaCaja) }))

/** El recorrido más chico de los ocho. Mayor que cero = la perilla no está inerte en ninguno. */
export const PEOR_RECORRIDO = Math.min(...RECORRIDOS.flatMap(({ filas }) => filas.map((f) => f.corregido)))

/**
 * Los recorridos de los cuadros que están ARRIBA del aspecto de recorrido nulo
 * de SU cámara — o sea donde la fórmula vieja también daba un número positivo.
 * Ahí las dos tienen que coincidir exactamente: es la mitad del arreglo que
 * garantiza que ninguna pose calibrada se movió.
 */
export const ARRIBA_DEL_CERO: readonly RecorridoMedido[] = RECORRIDOS.flatMap(({ camara, filas }) =>
  filas.filter((f) => f.ventana.aspecto > aspectoDeRecorridoNulo('demos', camara.anchoDeLaCaja)),
)

/** Las diez líneas de la tabla del §7: encabezado y las ocho filas. */
export function tablaDeRecorridos(): readonly string[] {
  const pct = (v: number): string => `${(v * 100).toFixed(1).padStart(6)}%`
  return [
    'pose `demos` (frameX 1) — recorrido lateral en unidades de mundo, con la fórmula vieja al lado',
    'cámara   cuadro     aspecto   con codo   corregido   corre en el cuadro',
    ...RECORRIDOS.flatMap(({ camara, filas }) =>
      filas.map(
        (f) =>
          `${camara.id.padEnd(8)} ${f.ventana.etiqueta.padEnd(9)} ${f.ventana.aspecto.toFixed(3)}   ` +
          `${f.conCodo.toFixed(4).padStart(7)}    ${f.corregido.toFixed(4).padStart(7)}   ${pct(f.enCuadro)}`,
      ),
    ),
  ]
}

/** El track real, y uno con la perilla vertical puesta para el control positivo. */
export const PISTA_REAL: Track = makeTrack(CHOREO_KEYFRAMES)
export const PISTA_CON_FRAME_Y: Track = makeTrack(
  CHOREO_KEYFRAMES.map((k) => ({ ...k, pose: { ...k.pose, frameY: 0.5 } })),
)

/**
 * ¿La cámara del muestreo (`camaraEnCuadro`, con el encuadre de producción) y la
 * del arnés (`cameraAt`, con el codo) coinciden en ese aspecto?
 *
 * Se compara en p=0,750, que es donde `demos` está en cuadro y `frameX` vale 1:
 * con `frameX = 0` las dos devuelven lo mismo por construcción y la comparación
 * no probaría nada.
 */
export function coincidenLasCamaras(aspecto: number): boolean {
  return mismaCamara(
    camaraEnCuadro(PISTA_REAL, 0.75, aspecto, emptyPose()),
    cameraAt(PISTA_REAL, 0.75, aspecto, emptyPose()),
  )
}

/** Los cuadros donde la corrección del encuadre es un no-op comprobable. */
export const CUADROS_SIN_CAMBIO: readonly Ventana[] = VENTANAS.filter(
  (v) => v.aspecto > aspectoDeRecorridoNulo('demos', CAMARAS[0].anchoDeLaCaja),
)

/**
 * EL PÁRRAFO DEL DEFECTO 7 — **derivado de la medición, no escrito.**
 *
 * ⚠ **Era una constante que decía «SIGUE ABIERTO», y en V3-E dejó de ser
 * cierta.** El defecto 7 lo cerró el ancla declarada del diferencial (0,8525):
 * la superposición mínima del titular pasó a **0% en los cuatro cuadros**, y el
 * párrafo seguía imprimiendo el 🔴 al lado de una tabla que publicaba ceros.
 * Un texto fijo al lado de una medición viva es la forma exacta del defecto que
 * este archivo existe para no tener.
 *
 * Ahora es una **función de la misma bandera que la tabla calcula**
 * (`inevitable`, de `tablaDeSuperposicion`), así que las dos no pueden volver a
 * desacordar: si alguien devuelve el ancla al borde del tramo, la tabla vuelve
 * a marcar 🔴 y este párrafo vuelve a decir que está abierto, sin que nadie
 * tenga que acordarse de editarlo.
 *
 * Está acá y no en el invariante porque es texto derivado de una medición que
 * ya se publicó arriba (§4 y §5), y porque el invariante tiene que poder leerse
 * como una lista de afirmaciones.
 */
export function parrafoDelDefecto7(tabla: TablaDeSuperposicion): string {
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`
  if (tabla.inevitable) {
    return [
      '🔴 EL DEFECTO 7 SIGUE ABIERTO. La superposición mínima del titular del diferencial sobre todas las',
      `posiciones verticales es MAYOR QUE CERO en algún cuadro (§4): entre ${pct(tabla.minimaDelDiferencial.menor)} y ${pct(tabla.minimaDelDiferencial.mayor)}, y ahí`,
      'el contraste es 1,11:1 (§5). La banda del logo cruza la columna de texto entera. No se arregla acá — es',
      'decisión del humano, y la regla ya está fijada: el texto no puede quedar encima del logo. Las salidas:',
    ].join('\n  ')
  }
  return [
    '✅ EL DEFECTO 7 ESTÁ CERRADO, Y NO LO CERRÓ ESTE ARCHIVO. La superposición mínima del titular del',
    `diferencial es ${pct(tabla.minimaDelDiferencial.mayor)} en los cuatro cuadros (§4): hay una posición vertical que lo deja limpio en todos.`,
    'Lo cerró V3-E **descuantizando el ancla** —la sección pasó a declarar dónde ADENTRO de su tramo llena el',
    'cuadro, 0,8525 en vez del borde 0,7500— y no tocando el encuadre. Las palancas de composición de abajo',
    'quedan medidas y SIN USAR: se publican porque son la reserva si el ancla se mueve, no porque hagan falta.',
  ].join('\n  ')
}
