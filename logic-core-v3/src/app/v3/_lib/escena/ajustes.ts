import { SHADOW_MAP_SIZE, SHADOW_RADIUS } from './probeAtmosphere'
import { PROBE_DEFAULTS } from './probeStore'
import type { NivelDeCalidad } from './calidad'

/**
 * LOS NÚMEROS DE CADA NIVEL — el presupuesto de píxel de la escena, por
 * escalón.
 *
 * ── Por qué está separado de `calidad.ts` ─────────────────────────────────
 *
 * `calidad.ts` lo consume la compuerta, que viaja en la carga inicial de `/v3`;
 * esto lo consumen `ProbeStage` y `EscenaDelHome`, que viven **adentro del chunk
 * perezoso**. Si los números estuvieran allá, todo lo que importan estas líneas
 * —la atmósfera y el store— viajaría en la carga inicial de toda página de /v3
 * sin que nadie lo pida. La partición es de alcance, no de tamaño.
 *
 * ── ⚠️ `plena` NO ES UNA COPIA: son las constantes de hoy, importadas ──────
 *
 * Cada campo de `plena` sale del archivo donde el valor ya vivía. Escribirlos a
 * mano habría creado la segunda copia de cuatro números que el repo ya tiene
 * calibrados, y una copia es lo que hace que un arreglo quede a medias.
 *
 * El `dpr` es la excepción y se dice: vivía como `DPR_DEL_CANVAS` en
 * `configuracionDelCanvas.ts`, que importa `three`. Se mudó ACÁ —y aquel archivo
 * lo re-exporta desde acá, así que sigue habiendo una sola definición— para que
 * este módulo no arrastre el paquete.
 *
 * ═══ LA MEDICIÓN DE MOVIL-1, ENTERA — Y LO QUE NO PUDO MEDIR ══════════════
 *
 * Los cinco campos se midieron de a uno a 390×844 con `deviceScaleFactor` 3,
 * sobre builds de producción, con `scripts-movil/`. **Ninguno se eligió por
 * intuición.**
 *
 * ── ⚠️ PRIMERO, LOS DOS LÍMITES DEL INSTRUMENTO, PORQUE CAMBIAN CÓMO SE LEE
 *    TODA LA TABLA ────────────────────────────────────────────────────────
 *
 * **1 · Los cuadros por segundo no discriminan NADA acá.** La escena SIN
 * degradar, a 390×844, dio **74,97 fps con p95 de 13,8 ms**, y lo dio igual con
 * el hilo principal estrangulado 4×. El monitor de esta máquina va a 75 Hz: la
 * escena está pegada al techo del refresco en TODAS las configuraciones
 * probadas. «Bajé el `dpr` y quedó en 75» y «no toqué nada y quedó en 75» son la
 * misma lectura. Por eso se agregó `scripts-movil/b-gpu.ts`, que mide el tiempo
 * del proceso de GPU por cuadro y no se satura con el vsync.
 *
 * **2 · Y ese segundo instrumento es CIEGO AL RELLENO, medido y no supuesto.**
 * Bajar el `dpr` de 1,5 a 1 saca el **55,6 %** de los píxeles rasterizados
 * (740.610 → 329.160) y el tiempo de GPU **no bajó**: 0,223 ms/cuadro el control
 * contra 0,2285 con el corte, o sea igual dentro de la dispersión. Lo que ese
 * número mide es el tiempo de CPU del proceso de GPU, que sigue a los COMANDOS y
 * a los cambios de estado, no a los fragmentos. Esta máquina sombrea 740.610
 * píxeles gratis; un teléfono no.
 *
 * **Consecuencia, sin adornos: este banco NO puede contestar «¿un teléfono llega
 * a 60 fps?». Puede ordenar los cortes entre sí por costo de comandos, y eso es
 * lo que la tabla publica.** Cerrar la pregunta necesita un teléfono real, y
 * queda anotado como lo primero del sprint que lo tenga.
 *
 * ── LA TABLA, en milisegundos de GPU por cuadro (reposo, mediana de 3) ────
 *
 *     configuración                                px/cuadro   WebGL ms   Δ
 *     ───────────────────────────────────────────────────────────────────────
 *     plena (control)                                740.610    0,223     —
 *     + dpr [1, 1]                                   329.160    0,2285    +0,006
 *     + motas 2400 → 1200                            329.160    0,2205    −0,003
 *     + sombra 1024 → 512 y radio 4 → 1              329.160    0,220     −0,003
 *     + antialias false                              329.160    0,201     −0,022
 *
 * ── ⚠️ Y LA DISPERSIÓN, QUE ES LO QUE DECIDE SI LA TABLA SIGNIFICA ALGO ───
 *
 * Hay DOS dispersiones y son de órdenes distintos. Publicar sólo la chica sería
 * el error:
 *
 *   · **entre corridas seguidas del MISMO build: ±0,005 ms.** Muy repetible.
 *     Con una excepción declarada: **la primera corrida después de un build da
 *     alto** (se vieron 0,250 y 0,237 contra medianas de 0,220) porque la
 *     máquina viene caliente de compilar. Se descarta.
 *   · **entre SESIONES de medición, sobre configuraciones idénticas: hasta
 *     0,07 ms.** Medido, no estimado: la configuración final —`dpr [1,1]` y el
 *     resto en `plena`— dio **0,2285** cuando se midió como corte (a) y
 *     **0,253** (0,303 · 0,253 · 0,236) cuando se volvió a medir al cierre, con
 *     el MISMO código. La máquina tiene otras cosas encima y no se puede
 *     silenciar.
 *
 * **La conclusión honesta contra la dispersión GRANDE, que es la que manda: NI
 * UNO de los cinco cortes se distingue de cero en esta máquina.** El de
 * `antialias` (0,022) es el mayor y sigue siendo tres veces más chico que la
 * deriva entre sesiones; es además el único cuya dirección es coherente con lo
 * que el instrumento sabe ver (MSAA agrega un buffer multimuestra y un pase de
 * resolución, o sea comandos), así que se lo publica como el candidato mejor
 * ordenado, **no como un ahorro demostrado**.
 *
 * ── ⚠️ QUÉ SE DEGRADA IGUAL, Y POR QUÉ NO ES CONTRADECIRSE ────────────────
 *
 * **`dpr: [1, 1]` se aplica AUNQUE haya medido cero.** No es que se ignore la
 * medición: es que la medición declaró, arriba, que es ciega justo a lo que este
 * corte ataca. Los dos argumentos que lo sostienen son independientes del banco:
 *
 *   · **La referencia hace exactamente esto.** A 390 clava su `pixelRatio` en 1
 *     con un `devicePixelRatio` de 3 —renderiza a un noveno de los píxeles
 *     físicos— y es la única perilla de resolución que toca (`WEBGL.md` §10).
 *   · **La física del caso.** El costo de esta escena es relleno: la celosía es
 *     un gobo analítico que resuelve dos intersecciones rayo-cilindro con cuatro
 *     `atan` y ocho evaluaciones de barra POR FRAGMENTO, sobre el 51–73 % del
 *     cuadro, y encima van dos cilindros transparentes que cubren el 51 % y el
 *     57 % en promedio. En una GPU de teléfono eso es lo primero que se rompe, y
 *     son exactamente 2,25 veces menos fragmentos.
 *
 * **Y los otros tres se quedan en `plena`, que es la otra mitad de la misma
 * disciplina: un corte que mide cero y se ve, no se aplica.**
 *
 *   · **`antialias`** es el mejor ordenado, y aun así son 0,022 ms sobre un
 *     presupuesto de 13,3 ms: **el 0,16 %**, y por debajo de la deriva entre
 *     sesiones. Lo que cuesta es el canto del logo, que es el único negro puro
 *     del cuadro y la marca. No se aplica; queda como la primera palanca para el
 *     día que un teléfono real diga que hace falta.
 *   · **`sombraPx` y `sombraRadio`** miden cero y se ven: el mapa a la mitad
 *     granula el borde de la sombra del logo sobre el papel.
 *   · **`motas`** mide cero y se ve: es la mitad del aire de la sala.
 *
 * ⚠️ **Lo que NO se probó, y con su motivo.** `BOKEH_COUNT` —que la
 * documentación de la propia escena nombra como *«la primera perilla si mobile
 * no rinde»*, con un overdraw de 2,0–8,5 % del cuadro contra 1,3 % de las
 * motas— **no se tocó**, por dos razones: su literal está clavado por una
 * afirmación de TEXTO en `s20-brillo.invariant.ts` («la cantidad no cambió: 3000
 * motas y 90 de bokeh»), así que moverlo es reescribir ese invariante; y sobre
 * todo, es una perilla de RELLENO, que es justo lo que este banco acaba de
 * demostrar que no puede medir. Cambiarlo acá sería elegir a ciegas.
 *
 * ── El post-procesado, que la instrucción pide apagar y que NO existe ──────
 *
 * El corte (b) del sprint —«el post-procesado»— **no tiene nada que apagar en
 * esta escena**: no hay `EffectComposer` ni `Bloom`. No es un olvido, es una
 * regla del repo y está en el contrato: `contrato.ts` lista
 * `@react-three/postprocessing` entre los paquetes que `/v3` no puede importar,
 * y `ProbeStage` lo explica —canvas opaco, objeto negro mate, el bloom no
 * aporta—. Lo que la referencia apaga a 390 (su `render()` cae de 18 pases a 2)
 * acá ya estaba en 1.
 */
export interface AjustesDeCalidad {
  /**
   * El `dpr` del `<Canvas>`. r3f lo interpreta como `[mínimo, máximo]` y lo
   * ACOTA contra `window.devicePixelRatio`: en un teléfono con dpr 3 el techo
   * es el que manda.
   */
  readonly dpr: [number, number]
  /**
   * `gl.antialias`. Es MSAA: antialiasa los CANTOS de la geometría, no el
   * contenido de una textura ni lo que calcula un shader. O sea que lo que
   * paga acá es la silueta del logo, y **no es lo que sostiene el moiré** —eso
   * son los mipmaps y la anisotropía de `MoireScreen` y el `fwidth` de la
   * celosía, que no se tocan.
   */
  readonly antialias: boolean
  /** El lado del mapa de sombra de la única luz que proyecta. */
  readonly sombraPx: number
  /**
   * `shadow-radius`, o sea el disco de PCF. NO es costo por pase: son ~20 taps
   * filtrados **por fragmento que recibe sombra**, y los receptores son el
   * piso, el ciclorama, las 48 marcas y el logo (`probeAtmosphere.ts:161-167`).
   */
  readonly sombraRadio: number
  /** Las motas dibujadas. Se aplica por `setDrawRange`: no reasigna un buffer. */
  readonly motas: number
}

/**
 * ⚠️ **CADA CAMPO DE `compacta` QUE NO SEA IGUAL AL DE `plena` TIENE SU NÚMERO
 * EN EL DOCBLOCK DE ARRIBA.** Hoy es uno solo. Los otros cuatro están acá,
 * iguales a `plena`, y **no es que falten**: se midieron, midieron cero, y se
 * dejan prendidos. La tabla es el menú del sprint que tenga un teléfono.
 */
export const AJUSTES: Readonly<Record<NivelDeCalidad, AjustesDeCalidad>> = {
  /** El techo de la regla del repo: `dpr={[1, 1.5]}` máximo, nunca 2 en producción. */
  plena: {
    dpr: [1, 1.5],
    antialias: true,
    sombraPx: SHADOW_MAP_SIZE,
    sombraRadio: SHADOW_RADIUS,
    motas: PROBE_DEFAULTS.particleCount,
  },
  compacta: {
    /** −55,6 % de píxeles rasterizados. El único campo degradado. */
    dpr: [1, 1],
    antialias: true,
    sombraPx: SHADOW_MAP_SIZE,
    sombraRadio: SHADOW_RADIUS,
    motas: PROBE_DEFAULTS.particleCount,
  },
}

export function ajustesDe(nivel: NivelDeCalidad): AjustesDeCalidad {
  return AJUSTES[nivel]
}
