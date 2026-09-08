/**
 * B7 · FRENTE D — CONDUCIR EL SCROLL CON LA RUEDA, Y DEJAR EL MOTOR EN CERO.
 *
 * Sale de `d-cuadro-lectores.ts` cuando ese archivo cruzó las 300 líneas del
 * repo al arreglar el guardián del tope, y el corte es por tema: allá quedan los
 * LECTORES —lo que corre adentro de la página y lo que se le pregunta—, y acá
 * está lo que **le hace** a la página: mover la rueda, calibrarla, volver al
 * tope y comprobar que el motor quedó donde dice.
 *
 * ⚠️ Los cuatro se usan juntos y en ese orden. Separarlos de los lectores no los
 * independiza: `calibrarLaRueda` llama a `volverAlTope`, y `volverAlTope` a
 * `conducirConLaRueda`, porque **volver al tope por el mismo canal que después
 * se conduce es la única forma de que el objetivo interno del motor vuelva con
 * la posición**. El porqué, con los 44,12 y 76,54 px/evento que lo destaparon,
 * está en el docblock de `volverAlTope`.
 */

import { medir } from '../scripts-b4/navegador'
import type { Pagina } from '../scripts-b4/navegador'

import { dos } from './b7-comun'
import { CALIBRACION_MS, PASO_PX, PERFIL, VELOCIDAD_OBJETIVO_PX_S } from './d-cuadro-lectores'

/**
 * La rueda, despachada desde Node sobre el centro del viewport.
 *
 * ⚠️ **El puntero queda en el MISMO punto en los tres brazos.** Un `mouseWheel`
 * lleva coordenadas y las escribe en el estado de puntero de r3f; si un brazo
 * moviera el cursor y el otro no, la diferencia de cuadros podría ser del
 * mouse-follow y no del scroll, y no habría cómo atribuirla.
 */
export async function conducirConLaRueda(p: Pagina, ms: number, delta: number): Promise<number> {
  const x = Math.round(PERFIL.ancho / 2)
  const y = Math.round(PERFIL.alto / 2)
  const hasta = Date.now() + ms
  let eventos = 0
  while (Date.now() < hasta) {
    const antes = Date.now()
    await p.conexion.enviar(
      'Input.dispatchMouseEvent',
      { type: 'mouseWheel', x, y, deltaX: 0, deltaY: delta, button: 'none', buttons: 0, modifiers: 0 },
      p.sessionId,
    )
    eventos += 1
    const resto = 16 - (Date.now() - antes)
    if (resto > 0) await new Promise((r) => setTimeout(r, resto))
  }
  return eventos
}

export interface Calibracion {
  readonly eventos: number
  readonly recorridoPx: number
  readonly velocidadPxS: number
  readonly deltaElegido: number
}

/** Mide la velocidad real de la rueda con el delta nominal y escala el delta. */
export async function calibrarLaRueda(p: Pagina): Promise<Calibracion> {
  await volverAlTope(p)
  const antes = await medir<number>(p, 'window.scrollY')
  const eventos = await conducirConLaRueda(p, CALIBRACION_MS, PASO_PX)
  await new Promise((r) => setTimeout(r, 600))
  const despues = await medir<number>(p, 'window.scrollY')
  const recorridoPx = despues - antes
  const velocidadPxS = (recorridoPx / CALIBRACION_MS) * 1000
  const deltaElegido =
    velocidadPxS <= 0 ? PASO_PX : Math.max(PASO_PX, Math.round((PASO_PX * VELOCIDAD_OBJETIVO_PX_S) / velocidadPxS))
  return { eventos, recorridoPx, velocidadPxS: dos(velocidadPxS), deltaElegido }
}

/**
 * ⚠️ **VOLVER AL TOPE CON LENIS NO ES `scrollTo(0, 0)` — medido, DOS VECES.**
 *
 * **La primera vez.** Lenis anima hacia un objetivo propio: después de un
 * barrido queda viajando, y un `scrollTo(0, 0)` seguido de 1.200 ms de espera
 * devolvió brazos que ARRANCABAN en y=7.392 y en y=7.464 en vez de en 0. Dos
 * brazos que arrancan en lugares distintos no se pueden comparar, y peor: uno de
 * ellos ni siquiera recorre la región bajo prueba. La respuesta fue insistir con
 * `scrollTo(0, 0)` hasta que `window.scrollY` se quedara en cero seis cuadros
 * seguidos.
 *
 * **La segunda vez, y ésta es la que importa: eso arreglaba el SÍNTOMA y no el
 * ESTADO.** `window.scrollY` es la POSICIÓN; el motor tiene además un OBJETIVO
 * interno, y forzar la posición no lo mueve. Medido: después de un
 * `volverAlTope` que devolvía `ok`, la misma calibración de rueda que da
 * **24,0 px/evento** en frío daba **44,12** y en el brazo siguiente **76,54**, y
 * el exceso era exactamente la posición donde había terminado el brazo anterior
 * (1.510 → 3.309 = 1.510 + 1.800; 3.309 → 4.822 = 3.309 + 1.512). **Cada brazo
 * arrancaba con el objetivo acumulado del anterior**, y el guardián decía que
 * todo estaba bien.
 *
 * ── La salida: volver al tope POR EL MISMO CANAL que después se usa ────────
 *
 * Se vuelve **con la rueda**, en negativo, en vez de pisando la posición. Así el
 * motor persigue el cero por su cuenta y su objetivo llega con él: no hay un
 * estado interno que quede atrás, porque no se le pasó por encima.
 *
 * Y no se confía: `verificarQueElMotorEstaEnCero` mide la respuesta con una
 * ráfaga corta y exige que sea la del arranque en frío. **Un guardián que
 * comprueba una variable distinta de la que el brazo necesita no es un
 * guardián**, y eso es exactamente lo que este archivo tenía.
 */
export async function volverAlTope(p: Pagina): Promise<void> {
  // Primero la rueda, que arrastra al motor con su objetivo. El delta negativo
  // es grande a propósito: lo que interesa es llegar, no la curva.
  for (let intento = 0; intento < 40; intento += 1) {
    const y = await medir<number>(p, 'window.scrollY')
    if (y <= 0) break
    await conducirConLaRueda(p, 220, -Math.min(600, Math.max(120, Math.round(y / 4))))
  }
  const logrado = await medir<{ ok: boolean; y: number }>(
    p,
    `(async () => {
      let quietas = 0
      for (let i = 0; i < 200; i += 1) {
        if (window.scrollY !== 0) window.scrollTo(0, 0)
        await new Promise((r) => requestAnimationFrame(r))
        if (window.scrollY === 0) quietas += 1
        else quietas = 0
        if (quietas >= 6) return { ok: true, y: window.scrollY }
      }
      return { ok: false, y: window.scrollY }
    })()`,
  )
  if (!logrado.ok) throw new Error(`no se pudo volver al tope: el scroll quedó en y=${logrado.y}`)
}

/**
 * ⚠️ **EL GUARDIÁN QUE MIRA LO QUE EL BRAZO NECESITA: LA RESPUESTA, NO LA POSICIÓN.**
 *
 * Manda una ráfaga corta de rueda y compara el desplazamiento por evento contra
 * el de referencia. Si el objetivo interno del motor quedó acumulado, la
 * respuesta se dispara —44 y 76 px/evento contra 24— y esto **tira**. Devuelve
 * la página al tope antes de salir, así el brazo arranca donde tiene que
 * arrancar.
 *
 * La tolerancia es del 25 %: la respuesta en frío se midió en 23,968 px/evento
 * en las dos superficies y las contaminaciones observadas la casi duplican, así
 * que un cuarto separa las dos poblaciones con margen de sobra en las dos
 * direcciones.
 */
export async function verificarQueElMotorEstaEnCero(p: Pagina, referenciaPxPorEvento: number): Promise<number> {
  const antes = await medir<number>(p, 'window.scrollY')
  const eventos = await conducirConLaRueda(p, 320, PASO_PX)
  await new Promise((r) => setTimeout(r, 500))
  const despues = await medir<number>(p, 'window.scrollY')
  const porEvento = eventos === 0 ? 0 : (despues - antes) / eventos
  await volverAlTope(p)
  if (Math.abs(porEvento - referenciaPxPorEvento) / referenciaPxPorEvento > 0.25) {
    throw new Error(
      `el motor de scroll NO está en cero: responde ${dos(porEvento)} px/evento contra los ${dos(referenciaPxPorEvento)} ` +
        'del arranque en frío. Su objetivo interno quedó acumulado del brazo anterior, y este brazo mediría otra cosa.',
    )
  }
  return porEvento
}

