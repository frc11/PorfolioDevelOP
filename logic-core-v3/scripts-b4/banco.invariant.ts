/**
 * INVARIANTE DEL BANCO DE MEDICIÓN DE B4.
 *
 *     npx tsx scripts-b4/banco.invariant.ts
 *
 * ── Por qué un banco tiene invariante ─────────────────────────────────────
 *
 * Porque la regla 7 del sprint dice «ninguna comprobación verde por vacío,
 * control positivo obligatorio en cada instrumento nuevo», y un banco de
 * medición es cinco instrumentos nuevos. Si el decodificador de PNG está roto,
 * el aire muerto de los cuatro perfiles de mobile da un número plausible y
 * equivocado, y tres frentes construyen encima.
 *
 * ── Lo que este archivo NO hace ───────────────────────────────────────────
 *
 * No abre el navegador y no afirma nada sobre `/v3`. Afirma sobre los
 * instrumentos: que el decodificador reconstruye los cinco filtros, que la
 * fórmula de luminancia es la de gamma y no la lineal, que un degradé se lee
 * como aire —que es la definición y no un detalle— y que el agrupamiento del
 * censo funde en `2·paso` y no en otro lado.
 *
 * ⚠️ **No está en `npm run verificar` a propósito.** Meterlo ahí obliga a editar
 * `package.json`, que es un archivo compartido con el lane que corre en paralelo
 * en `C:\v3-costura`. El costo de no estar es que hay que correrlo a mano; el
 * costo de estar habría sido un conflicto de merge en el archivo que
 * `verificar` §1 existe para custodiar. Queda a mano, y su salida va al reporte.
 */

import { readFileSync } from 'node:fs'

import { ESCENARIO_MIN_ANCHO_PX } from '../src/app/v3/_lib/compuerta'
import { SECCIONES as SECCIONES_DEL_SITIO } from '../src/app/v3/_lib/secciones'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../src/app/v3/_lib/__tests__/afirmar'

import { BANDA_VACIA_OBJETIVO_PX, UMBRAL_DE_BORDE, aireMuerto } from './aire-muerto'
import { bandaEnElMedio, degrade, lecturaSintetica, liso, rayasVerticales, ruido } from './banco-fixturas'
import { FRENTES, SECCIONES, indiceComoTabla, indiceDeCapturas, rutaDeCaptura } from './capturas'
import { agrupar, fuenteDelCenso } from './censo'
import { contraste, luminancia } from './color'
import { codificarPngRgba, decodificarPng, type Imagen } from './png'
import {
  ESTRANGULAMIENTOS,
  PERFILES,
  PERFILES_DEBAJO_DEL_UMBRAL,
  UMBRAL_DEL_ESCENARIO_PX,
  cadenaDeViewport,
  perfilPorId,
} from './perfiles'

/** Decodifica desde bytes en memoria, que es la forma en que se usan las fixturas. */
function comoImagen(ancho: number, alto: number, datos: Uint8Array, filtro?: (y: number) => number): Imagen {
  return decodificarPng(codificarPngRgba(ancho, alto, datos, filtro))
}

titulo('1 · LOS SIETE PERFILES — el viewport, y lo que un viewport no es')

afirmarIgual(PERFILES.length, 7, 'son siete perfiles')
afirmarIgual(
  PERFILES.map((p) => p.id),
  ['375', '393', '768', '1024', '1025', '1440', '1920'],
  'y son los siete que la instrucción pide, en orden de ancho',
)
afirmarIgual(
  UMBRAL_DEL_ESCENARIO_PX,
  ESCENARIO_MIN_ANCHO_PX,
  'el umbral del banco es el MISMO que `_lib/compuerta.ts` — no una copia que puede envejecer',
)
afirmarIgual(
  PERFILES_DEBAJO_DEL_UMBRAL.map((p) => p.id),
  ['375', '393', '768', '1024'],
  'cuatro perfiles caen abajo del umbral, que es el scope del frente B',
)
afirmar(
  PERFILES.every((p) => (p.ancho < ESCENARIO_MIN_ANCHO_PX) === p.debajoDelUmbral),
  '  y `debajoDelUmbral` se corresponde con el ancho en los siete: nadie lo escribió a mano mal',
)
afirmar(PERFILES.every((p) => p.dpr === 1), 'los siete van en `dpr` 1 — la regla del paso 2 de la receta')
afirmarIgual(
  perfilPorId('1024').alto,
  perfilPorId('1025').alto,
  'el par que straddlea el umbral comparte el alto: la única variable es el ancho',
)
afirmarIgual(
  perfilPorId('1025').ancho - perfilPorId('1024').ancho,
  1,
  '  y difieren en UN píxel, que es el ancho al que la compuerta abre',
)
afirmarIgual(cadenaDeViewport(perfilPorId('375')), '375x667x1,mobile,touch', 'la cadena de `emulate` se deriva del perfil')
afirmarIgual(cadenaDeViewport(perfilPorId('1920')), '1920x1080x1', '  y sin banderas donde el perfil no es táctil')
afirmar(
  PERFILES.every((p) => p.procedencia.length > 20),
  'los siete declaran DE DÓNDE sale su tamaño: un perfil sin procedencia es un número inventado',
)
afirmar(
  ESTRANGULAMIENTOS.every((e) => e.equivalencia.includes('Lighthouse') || e.id === 'ninguno'),
  'los presets de estrangulamiento declaran a qué preset de Lighthouse se parecen y en qué no',
)
controlPositivo('`perfilPorId` no inventa un perfil que no existe', '800', (id: string) => {
  perfilPorId(id)
  return true
})

titulo('2 · EL DECODIFICADOR DE PNG — los cinco filtros, y un archivo real')

const RUIDO = ruido(64, 40)
const TODOS_LOS_FILTROS = comoImagen(64, 40, RUIDO, (y) => y % 5)
afirmarIgual([TODOS_LOS_FILTROS.ancho, TODOS_LOS_FILTROS.alto], [64, 40], 'un PNG propio vuelve con su tamaño')
afirmarIgual(
  [...new Set(TODOS_LOS_FILTROS.filtros)].sort(),
  [0, 1, 2, 3, 4],
  '  y la fixtura ejercita LOS CINCO filtros de fila del estándar, no sólo el 0',
)
afirmar(
  TODOS_LOS_FILTROS.datos.every((b, i) => b === RUIDO[i]),
  '  y los 10.240 bytes vuelven idénticos: los cinco predictores reconstruyen bien',
)

/**
 * ⚠️ El archivo real importa porque lo escribió Chrome, no este repo. Un
 * decodificador que sólo se prueba contra su propio codificador comparte con él
 * cualquier malentendido del formato.
 */
const REAL = decodificarPng(readFileSync('docs/rediseno/capturas/b1/quienes-somos-1920-antes.png'))
afirmarIgual(REAL.ancho, 1920, 'una captura REAL de B1 decodifica, y su ancho es el que la receta declara')
afirmar(REAL.alto > 1080, '  y su alto es mayor que una pantalla: es la captura por `uid` de la sección entera', String(REAL.alto))
afirmar(
  REAL.filtros.some((f) => f !== 0),
  '  y Chrome usó filtros distintos de 0, así que el archivo real ejercita el camino que importa',
)
afirmar(
  REAL.datos.length === REAL.ancho * REAL.alto * 4,
  '  y la banda RGBA tiene exactamente cuatro bytes por píxel',
)
controlPositivo('el decodificador no le pasa la mano a un archivo que no es PNG', Buffer.from('no soy un png'), (b: Buffer) => {
  decodificarPng(b)
  return true
})
controlPositivo(
  'ni a un PNG con una profundidad que no entiende',
  // La profundidad de bits vive en el byte 8 de los datos de IHDR: 8 de firma,
  // 4 de largo y 4 de tipo por delante, o sea el byte 24 del archivo.
  ((): Buffer => {
    const b = codificarPngRgba(4, 4, liso(4, 4, 128))
    b[24] = 16
    return b
  })(),
  (b: Buffer) => {
    decodificarPng(b)
    return true
  },
)

titulo('3 · LUMINANCIA Y CONTRASTE — la fórmula con gamma, no la lineal')

afirmarIgual(Math.round(contraste(luminancia(255, 255, 255), luminancia(0, 0, 0))), 21, 'blanco contra negro da 21:1')
afirmarIgual(contraste(luminancia(17, 17, 17), luminancia(17, 17, 17)), 1, 'un color contra sí mismo da 1:1')
afirmar(
  Math.abs(luminancia(128, 128, 128) - 0.2159) < 0.001,
  'el gris medio da 0,2159 de luminancia — el número de la curva sRGB',
  luminancia(128, 128, 128).toFixed(4),
)
controlPositivo(
  'la fórmula NO es la lineal — un gris 128 lineal daría 0,502 y eso sería el error clásico',
  128,
  (g: number) => Math.abs(luminancia(g, g, g) - g / 255) < 0.01,
)
controlPositivo('y el verde no pesa lo mismo que el azul', 0, () => {
  return Math.abs(luminancia(0, 255, 0) - luminancia(0, 0, 255)) < 0.01
})

titulo('4 · AIRE MUERTO — la definición de B1 §3, con su propiedad definitoria')

afirmarIgual(aireMuerto(comoImagen(64, 40, liso(64, 40, 200))).porcentaje, 100, 'una imagen lisa es 100 % aire muerto')
afirmarIgual(aireMuerto(comoImagen(64, 40, rayasVerticales(64, 40))).porcentaje, 0, 'rayas verticales de 1 px son 0 %')

/**
 * ⚠️ ESTA ES LA AFIRMACIÓN QUE DEFINE LA MÉTRICA, y no una prueba de código.
 * B1 §3: «un degradé de fondo tiene varianza alta y no es contenido». Si alguien
 * cambia el detector a una varianza o a un rango, esto se pone rojo.
 */
const DEGRADE = comoImagen(1024, 20, degrade(1024, 20))
afirmarIgual(aireMuerto(DEGRADE).porcentaje, 100, 'un degradé suave de negro a blanco es AIRE, no contenido')
afirmar(
  aireMuerto(DEGRADE).porcentajeConVertical === 100,
  '  y también con el borde vertical: un degradé horizontal no varía entre filas',
)
controlPositivo(
  'un detector por RANGO daría contenido donde la definición dice aire',
  DEGRADE,
  (img: Imagen) => {
    let min = 255
    let max = 0
    for (let x = 0; x < img.ancho; x += 1) {
      min = Math.min(min, img.datos[x * 4])
      max = Math.max(max, img.datos[x * 4])
    }
    return max - min <= 5
  },
)

const BANDA = aireMuerto(comoImagen(64, 100, bandaEnElMedio(64, 100, 50)))
afirmarIgual(BANDA.filasSinContenido, 99, 'con una sola fila con bordes, 99 de 100 filas son aire')
afirmarIgual(BANDA.bandaVaciaMaxPx, 50, '  y la banda vacía CONTINUA más larga son 50 px, no 99')
afirmarIgual(BANDA.bandaVaciaMaxDesdeY, 0, '  y arranca en la fila 0, que es donde se la va a buscar en la captura')
afirmarIgual(UMBRAL_DE_BORDE, 0.02, 'el umbral es el 0,02 de la definición de B1')
afirmarIgual(BANDA_VACIA_OBJETIVO_PX, 104, 'y la vara heredada son los 104 px de la mejor sección que el sitio ya tenía')
controlPositivo('el instrumento no devuelve 0 % contra una imagen vacía: tira', comoImagen(2, 1, liso(2, 1, 0)), (img: Imagen) => {
  return aireMuerto({ ...img, alto: 0 }).porcentaje === 0
})

titulo('5 · EL CENSO — el agrupamiento funde en 2·paso, y en ningún otro lado')

const CENSO = agrupar(lecturaSintetica([[0, 3], [120, 2], [960, 5]], 120, 1080))
afirmarIgual(CENSO.acontecimientos, 2, 'dos aterrizajes a un paso y uno lejos dan DOS acontecimientos')
afirmarIgual(CENSO.grupos[0], { ini: 0, fin: 120, piezas: 5 }, '  y el primero suma las piezas de sus dos aterrizajes')
afirmarIgual(CENSO.huecosPx, [840], '  y el hueco se mide del FIN de uno al INICIO del siguiente')
afirmarIgual(CENSO.huecosPantallas, [0.78], '  y en pantallas contra `innerHeight`, no contra el documento')
afirmarIgual(agrupar(lecturaSintetica([[0, 1], [240, 1]], 120, 1080)).acontecimientos, 1, 'a 2·paso exacto, funde')
afirmarIgual(agrupar(lecturaSintetica([[0, 1], [241, 1]], 120, 1080)).acontecimientos, 2, 'a 2·paso + 1, NO funde')
afirmarIgual(agrupar(lecturaSintetica([], 120, 667)).acontecimientos, 0, 'sin aterrizajes hay CERO acontecimientos — que es un hallazgo, no un error')
afirmarIgual(agrupar(lecturaSintetica([], 120, 667)).huecoMaximoPantallas, null, '  y el hueco máximo es `null`, no 0: no hay hueco que medir')
controlPositivo('el censo no acepta una ventana de 0 — la pestaña oculta da `innerHeight` 0', 0, (v: number) => {
  agrupar(lecturaSintetica([[0, 1]], 120, v))
  return true
})

const FUENTE = fuenteDelCenso({ desde: 0, hasta: 4320, paso: 120 })
afirmar(FUENTE.startsWith('async () =>'), 'la fuente del censo es una declaración de función para `evaluate_script`')
afirmar(FUENTE.includes('const DESDE = 0, HASTA = 4320, PASO = 120'), '  y lleva sus parámetros adentro, no por argumento')
afirmar(FUENTE.includes("n.tagName.toLowerCase() + ':'"), '  y la clave es la RUTA del DOM — la trampa que B2 pagó con 94 contra 190')
afirmar(FUENTE.includes('visibilityState'), '  y devuelve `visibilityState` para que ninguna lectura se crea sin verificar')
controlPositivo('la fuente del censo es JavaScript que parsea', 0, () => {
  new Function(`return (${fuenteDelCenso({ desde: 0, hasta: 1, paso: 1 })})`)
  return false
})

titulo('6 · LAS CAPTURAS — la ruta se deriva, y la lista de secciones no envejece')

afirmarIgual(SECCIONES, SECCIONES_DEL_SITIO.map((s) => s.id), 'la copia de las ocho secciones coincide con `_lib/secciones.ts`')
afirmarIgual(FRENTES.length, 3, 'son tres frentes')
afirmarIgual(
  rutaDeCaptura('b', '375', 'numeros'),
  'docs/rediseno/capturas/b4/b/375-numeros.png',
  'la ruta de una captura se deriva de sus tres partes',
)
controlPositivo('no se puede guardar una captura de un perfil que no existe', 'x', (p: string) => {
  rutaDeCaptura('b', p, 'hero')
  return true
})
controlPositivo('ni de un asunto que nadie declaró', 'lo-que-sea', (a: string) => {
  rutaDeCaptura('c', '1440', a)
  return true
})
const INDICE = indiceDeCapturas()
console.log(`\n  índice de capturas al momento de correr esto: ${INDICE.length} archivo(s)`)
console.log(indiceComoTabla(INDICE).replace(/^/gm, '  '))

cerrar('banco de medición B4')
