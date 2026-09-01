/**
 * LA MÁSCARA DEL LOGO CON POSICIONES — dónde está la masa negra dentro del
 * cuadro, y con qué valor está sombreada.
 *
 * ⚠ **Este archivo NO se escanea por tokens.** Es un instrumento: sus números
 * son coordenadas de cuadro (−1…1) y tamaños de grilla de muestreo, no valores
 * de diseño. Ni un color, ni una medida, ni una tipografía salen de acá.
 *
 * ── Por qué existe, si `cuadro.ts` ya muestrea el cuadro ───────────────────
 *
 * Porque `muestrearCuadro` devuelve **cuántas** celdas son logo (`enLogo`) y no
 * **dónde** están. Las tres preguntas de este frente —qué fracción del logo se
 * va del cuadro, cuánto se superpone con una caja de texto, y qué contraste
 * tiene la tinta del texto sobre ÉL— son todas posicionales. Y hay una cuarta
 * diferencia que obliga: `cuadro.ts` fija `ASPECT = 16/9` como constante de
 * módulo, y el eje que este frente tiene que medir es justamente **la relación
 * de aspecto** (§7.6, abierto: *«en vertical el logo no entra igual»*). Acá el
 * aspecto entra por parámetro y llega hasta `cameraAt`, que es donde decide el
 * encuadre.
 *
 * ── LO QUE HACE HONESTA A ESTA COPIA: dos controles de equivalencia ────────
 *
 * Con la misma grilla, el mismo aspecto (16/9) y la misma variante de escena:
 *
 *   1. `celdasDeLogo` tiene que dar **exactamente** `muestrearCuadro(...).enLogo`.
 *   2. La suma de los valores sombreados de esas celdas tiene que dar
 *      **`media × total − Σ sinLogo`**, que es el complemento que `cuadro.ts`
 *      publica sin saberlo. Eso valida el SOMBREADO del logo, que es lo único
 *      que ningún instrumento anterior podía comprobar: `s8-tinta` mide contra
 *      `sinLogo` y **descarta exactamente estos píxeles**.
 *
 * Sin los dos, las cifras de acá no se pueden comparar con ninguna de S8/S9.
 *
 * ── LA VENTANA DE LA MEDICIÓN, heredada y declarada (§7.15, §7.29) ─────────
 *
 * 1. **La cámara es la de `harness.ts`, que NO es la del rig.** Declara la caja
 *    del logo como 7,168 × 7,168 y el rig le pasa el mesh medido en runtime,
 *    6,863 × 4,779; con `frameX ≠ 0` las dos apuntan a lugares distintos —hasta
 *    **1,28% del ancho del cuadro en la pose de Demos**, que es justamente la
 *    pose que este frente mide—. ⚠ Y acá el desvío deja de ser un porcentaje
 *    chico: `travelX = max(0, medioAncho − LOGO_W/2) × 0,88` tiene un **codo en
 *    cero**, y las dos cámaras lo cruzan en aspectos distintos. Se publica.
 * 2. **No modela las partículas, ni la sombra proyectada del logo, ni el
 *    especular.** Los tres empujan el valor del cuadro hacia abajo, o sea que
 *    todo contraste que salga de acá es un **TECHO, no un piso**.
 * 3. **La tinta se muestrea con la máscara real del SVG** (`rayLogoInk`), o sea
 *    el trazo y no su caja: 6,849 × 4,765 de mundo.
 * 4. **Es la escena, no la página.** Dónde cae una caja de texto lo deriva
 *    `s10-logo-cajas.ts`, con sus propios supuestos declarados.
 *
 * ── El reparto en cuatro archivos, con su costura ─────────────────────────
 *
 * Acá vive **el muestreo** y nada más: la máscara y su tipo. Lo que se LEE de
 * una muestra —fracción, cobertura, superposición, barrido— está en
 * `s10-logo-lectura.ts`; dónde caen las cajas de texto, en `s10-logo-cajas.ts`;
 * y las afirmaciones, en `s10-logo.invariant.ts`. La regla de 300 líneas del
 * repo obligó el corte, pero la costura es real: cambiar una pregunta no toca
 * el muestreador, y arreglar el muestreador no mueve una pregunta.
 */

import { celosiaTransmittance } from '../celosiaGeometry'
import { INK_COLOR } from '../probeScene'
import {
  cycloramaRadius,
  rayFloor,
  rayLogoInk,
  track,
  type SceneVariant,
} from '@/app/probe-escena/__tests__/frameProbe'
import {
  TAN_HALF_V,
  cameraAt,
  emptyPose,
  halfFovDeg,
  type Track,
  type Vec3,
} from '@/app/probe-escena/__tests__/harness'
import { shadeSurface, sunDirectionAt, type ViewContext } from '@/app/probe-escena/__tests__/shading'

/** Una caja en coordenadas de cuadro: −1 es el borde izquierdo/inferior, +1 el otro. */
export interface CajaEnCuadro {
  readonly x0: number
  readonly x1: number
  readonly y0: number
  readonly y1: number
}

export interface MuestraDelLogo {
  readonly progreso: number
  readonly aspecto: number
  readonly columnas: number
  readonly filas: number
  /** Cuánto más ancha que el cuadro es la grilla, en cada eje. 1 = el cuadro. */
  readonly factor: number
  /** Coordenada de cuadro de cada celda con tinta, en el orden del recorrido. */
  readonly x: Float64Array
  readonly y: Float64Array
  /** Valor sombreado 0..255 de esa celda. */
  readonly valor: Float64Array
  /** Cuántas celdas de la grilla EXTENDIDA tienen tinta del logo por delante. */
  readonly celdasDeLogo: number
  /** De ésas, cuántas caen dentro del cuadro. */
  readonly enCuadro: number
  /** Cuántas celdas de la grilla caen dentro del cuadro. El denominador de cobertura. */
  readonly celdasDelCuadro: number
  /** Si hay tinta en el anillo exterior de la grilla: entonces el total está TRUNCADO. */
  readonly tocaElBorde: boolean
}

/**
 * Marcha una grilla de rayos **más ancha que el cuadro** y devuelve la posición
 * y el valor de cada celda que cae sobre la tinta del logo.
 *
 * El área es la clave del método: en la parametrización de una cámara pinhole
 * las celdas son **uniformes en el plano de imagen**, así que contar celdas ES
 * medir área proyectada —dentro y fuera del cuadro con la misma unidad—.
 * `factor > 1` extiende el campo sin cambiar el tamaño de celda, y
 * `tocaElBorde` avisa si aun así el logo no entró entero: sin ese aviso, un
 * total truncado se leería como «el logo entra».
 *
 * ⚠ `pista` existe para **medir una palanca sin moverla**: se le pasa un track
 * armado con `makeTrack` sobre una copia de los keyframes y se lee cuánto
 * cambiaría la cifra. `CHOREO_KEYFRAMES` no se toca; el default es el track
 * real, y todo lo que se publique con otra pista se rotula como hipotético.
 */
export function muestrearLogo(
  progreso: number,
  aspecto: number,
  variante: SceneVariant,
  columnas: number,
  filas: number,
  factor = 1,
  pista: Track = track,
): MuestraDelLogo {
  const pose = emptyPose()
  const cam = cameraAt(pista, progreso, aspecto, pose)
  const vista: ViewContext = {
    progress: progreso,
    cameraAzimuthDeg: pose.angleDeg,
    cameraHeight: pose.height,
  }
  const tanH = Math.tan((halfFovDeg(aspecto).h * Math.PI) / 180)
  const celosia = variante.celosia
  const sol = celosia ? sunDirectionAt(progreso) : null
  const cielo = celosia ? celosia.sky : 1

  const capacidad = columnas * filas
  const x = new Float64Array(capacidad)
  const y = new Float64Array(capacidad)
  const valor = new Float64Array(capacidad)
  let celdasDeLogo = 0
  let enCuadro = 0
  let celdasDelCuadro = 0
  let tocaElBorde = false

  for (let iy = 0; iy < filas; iy += 1) {
    const cy = (((iy + 0.5) / filas) * 2 - 1) * factor
    const ny = cy * TAN_HALF_V
    for (let ix = 0; ix < columnas; ix += 1) {
      const cx = (((ix + 0.5) / columnas) * 2 - 1) * factor
      const nx = cx * tanH
      if (Math.abs(cx) <= 1 && Math.abs(cy) <= 1) celdasDelCuadro += 1

      const crudo: Vec3 = [
        cam.forward[0] + cam.right[0] * nx + cam.up[0] * ny,
        cam.forward[1] + cam.right[1] * nx + cam.up[1] * ny,
        cam.forward[2] + cam.right[2] * nx + cam.up[2] * ny,
      ]
      const largo = Math.hypot(crudo[0], crudo[1], crudo[2])
      const dir: Vec3 = [crudo[0] / largo, crudo[1] / largo, crudo[2] / largo]

      // Lo opaco de atrás, exactamente como `cuadro.ts`: piso y después ciclorama.
      let profundidad = rayFloor(cam.position, dir)
      if (!isFinite(profundidad)) {
        for (let t = 0.5; t < 260; t += 0.5) {
          const px = cam.position[0] + dir[0] * t
          const py = cam.position[1] + dir[1] * t
          const pz = cam.position[2] + dir[2] * t
          if (Math.hypot(px, pz) >= cycloramaRadius(py)) {
            profundidad = t
            break
          }
        }
      }
      const tTinta = rayLogoInk(cam.position, dir)
      if (!(tTinta < profundidad)) continue

      const normal: Vec3 = [0, 0, dir[2] < 0 ? 1 : -1]
      let gobo = 1
      if (celosia && sol) {
        gobo = celosiaTransmittance(
          [
            cam.position[0] + dir[0] * tTinta,
            cam.position[1] + dir[1] * tTinta,
            cam.position[2] + dir[2] * tTinta,
          ],
          sol,
          celosia.bar,
          variante.mismatch ?? 0,
          celosia.drift ?? 0,
          celosia.spread ?? 0,
        )
      }

      x[celdasDeLogo] = cx
      y[celdasDeLogo] = cy
      valor[celdasDeLogo] = shadeSurface(INK_COLOR, normal, vista, tTinta, gobo, cielo)
      celdasDeLogo += 1
      if (Math.abs(cx) <= 1 && Math.abs(cy) <= 1) enCuadro += 1
      if (ix === 0 || ix === columnas - 1 || iy === 0 || iy === filas - 1) tocaElBorde = true
    }
  }

  return {
    progreso,
    aspecto,
    columnas,
    filas,
    factor,
    x: x.slice(0, celdasDeLogo),
    y: y.slice(0, celdasDeLogo),
    valor: valor.slice(0, celdasDeLogo),
    celdasDeLogo,
    enCuadro,
    celdasDelCuadro,
    tocaElBorde,
  }
}
/**
 * UNA MUESTRA FABRICADA — para que el control positivo corra las MISMAS
 * funciones contra una entrada de la que ya se sabe la respuesta.
 *
 * Cada punto son sus dos coordenadas de cuadro y su valor. Con ella se
 * comprueba que `fraccionDentro` sabe ver un logo que se sale del cuadro, que
 * `superposicion` sabe devolver cero, y que los estadísticos no están leyendo
 * un array vacío.
 */
export function muestraFabricada(
  puntos: readonly (readonly [number, number, number])[],
  columnas = 100,
  filas = 100,
  factor = 2,
): MuestraDelLogo {
  let enCuadro = 0
  for (const [px, py] of puntos) if (Math.abs(px) <= 1 && Math.abs(py) <= 1) enCuadro += 1
  return {
    progreso: 0,
    aspecto: 1,
    columnas,
    filas,
    factor,
    x: Float64Array.from(puntos.map((p) => p[0])),
    y: Float64Array.from(puntos.map((p) => p[1])),
    valor: Float64Array.from(puntos.map((p) => p[2])),
    celdasDeLogo: puntos.length,
    enCuadro,
    celdasDelCuadro: Math.round((columnas * filas) / (factor * factor)),
    tocaElBorde: false,
  }
}
