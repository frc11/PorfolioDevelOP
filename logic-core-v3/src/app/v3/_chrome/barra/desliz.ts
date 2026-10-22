/**
 * [T0 · 2026-10-22] T2 · CUÁNDO ARRANCA EL DESLIZAMIENTO DE LA PÍLDORA — puro (lo prueba s78-t0).
 *
 * Lo que midió el orquestador en el dev (`scripts-carga/velo.ts` a 1440, «la página → el home»): con el WIP (`97c80a64`: arrancar un cuadro
 * después del aviso `destapa`, con la hora de `performance.now()`), la más rápida entre dos muestras dio 6,51 px/ms (su curva da a lo sumo
 * 2,64) y el salto, 214,5 px. No era la curva: el home todavía se estaba montando (un cuadro largo de 84 ms justo después del destape, y
 * ~530 ms más cuando el velo queda quieto y arrancan las obras que lo esperan). En un cuadro que llega tarde el navegador calcula las
 * animaciones con la hora VIEJA del cuadro (la del vsync que esperaba) y el banco anota la de ahora: dos muestras seguidas cubren mucho más
 * tiempo de la animación que el que dice su reloj. La banda del velo (otra animación del compositor) mostró lo mismo en esas dos muestras:
 * su cobertura pasó de 1 a 0,435 en 35 ms del banco (≥ 167 ms de su propia animación).
 *
 * La regla: la píldora no se desliza a través de un cuadro largo del montaje.
 *   · Arranca recién con el hilo calmo: `seguidos` cuadros al hilo con la hora del cuadro fresca (`frescoMs`: la hora del rAF a lo sumo eso
 *     detrás de `performance.now()`) y el intervalo corto (`intervaloMs`); con un techo (`esperaMaximaMs`), así nunca queda retenida.
 *   · Mientras se desliza, retiene el «quieto» del velo (`retenerElQuieto`): las obras pesadas que esperan al velo quieto no caen en medio.
 *   · Su `startTime` es la hora de ese cuadro calmo y rellena hacia atrás (`fill: 'backwards'`): en ningún cuadro se ve en el destino antes de
 *     tiempo, ni empieza «en el pasado».
 */
export const CALMA_DEL_DESLIZ = { frescoMs: 8, intervaloMs: 24, seguidos: 2, esperaMaximaMs: 400, retencionMaximaMs: 2000 } as const

/** Un cuadro visto por la píldora: `ahora` (performance.now() en su rAF) y `hora` (el sello del rAF: con la que se calculan las animaciones). */
export interface CuadroDelDesliz {
  readonly ahora: number
  readonly hora: number
}

/** ¿Es calmo? La hora del cuadro fresca y el intervalo desde el cuadro anterior corto (sin anterior, todavía no se sabe: no). */
export function cuadroCalmo(anterior: CuadroDelDesliz | null, c: CuadroDelDesliz): boolean {
  return anterior !== null && c.ahora - c.hora <= CALMA_DEL_DESLIZ.frescoMs && c.ahora - anterior.ahora <= CALMA_DEL_DESLIZ.intervaloMs
}

/** ¿Arranca en este cuadro? Con `seguidos` cuadros calmos al hilo, o pasada la espera máxima desde el destape. */
export function arrancaElDesliz(calmosSeguidos: number, esperandoMs: number): boolean {
  return calmosSeguidos >= CALMA_DEL_DESLIZ.seguidos || esperandoMs >= CALMA_DEL_DESLIZ.esperaMaximaMs
}

/** La curva del deslizamiento (la de la casa, `--ease-principal`). */
export const CURVA_DEL_DESLIZ = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
