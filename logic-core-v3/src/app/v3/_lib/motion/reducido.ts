'use client'

import { useReducedMotionConfig } from 'motion/react'

/**
 * REDUCCIÓN DE MOVIMIENTO — acá el sistema no se acelera: no existe.
 *
 * ── Qué hace la referencia, y por qué no se copia ──────────────────────────
 *
 * La referencia respeta la preferencia **en su capa de animación y la ignora en
 * el scroll**: con `prefers-reduced-motion` puesta pasa de 291 instancias de
 * ScrollTrigger a 12, pero Lenis sigue cargado y activo —`window.lenisVersion`
 * devuelve 1.0.42 en las seis capturas con la preferencia—, o sea que el scroll
 * lo sigue manejando la librería. El scroll suave programático es justamente uno
 * de los efectos que la preferencia busca evitar. Es uno de sus cinco hallazgos
 * de accesibilidad.
 *
 * En /v3 ese hallazgo no se puede repetir aunque quisiéramos: S1 excluyó Lenis
 * de todo el árbol por ruta, así que abajo no hay scroll programático que apagar.
 * Lo que sí hay que decidir es qué pasa con los nueve patrones, y la decisión es
 * la del sprint: **no se montan**. No "más rápido", no "sin desplazamiento":
 * el motor de progreso no se instancia, el divisor de líneas no corre, y el
 * contenido se renderiza directamente en su estado final.
 *
 * ── Por qué "no montar" y no "duración cero" ───────────────────────────────
 *
 * Porque son cosas distintas y solo una es honesta. Con duración cero el sistema
 * sigue midiendo cajas, sigue suscrito al scroll, sigue escribiendo `transform`
 * en cada cuadro y sigue partiendo el texto en líneas —con todo lo que eso
 * arrastra para un lector de pantalla—, para terminar mostrando lo mismo. Con
 * "no montar" no queda nada de eso: es un árbol de React más chico, sin oyentes,
 * sin medición y sin partir el texto.
 *
 * ── Cómo se comprueba, y con qué control ───────────────────────────────────
 *
 * `useReducedMotionConfig` respeta `MotionConfig reducedMotion="always" | "never"`,
 * así que el mismo componente se puede renderizar a HTML con la preferencia
 * puesta y sin ella, en el mismo proceso y sin navegador.
 * `__tests__/reducido.invariant.tsx` afirma que con la preferencia NO aparece
 * ninguna transformada ni el texto partido, y —el control positivo— que SIN la
 * preferencia las dos cosas SÍ aparecen. Sin esa segunda mitad, la primera
 * pasaría en verde aunque el sistema estuviera roto y no montara nada nunca.
 */

/** Qué monta el sistema, según la preferencia. Es la política, como dato. */
export interface PoliticaDeMovimiento {
  /** Si se instancia el motor de progreso (medición de caja + scroll). */
  readonly montaElMotorDeProgreso: boolean
  /** Si el texto se parte en líneas. */
  readonly montaElDivisorDeLineas: boolean
  /** Si se escribe `transform` en algún elemento. */
  readonly aplicaTransformadas: boolean
}

const CON_MOVIMIENTO: PoliticaDeMovimiento = {
  montaElMotorDeProgreso: true,
  montaElDivisorDeLineas: true,
  aplicaTransformadas: true,
}

const SIN_MOVIMIENTO: PoliticaDeMovimiento = {
  montaElMotorDeProgreso: false,
  montaElDivisorDeLineas: false,
  aplicaTransformadas: false,
}

/**
 * La política. Es total —las tres respuestas son la misma— y eso es el punto:
 * no hay un modo intermedio donde el motor corra "más suave".
 */
export function politicaDeMovimiento(reducido: boolean): PoliticaDeMovimiento {
  return reducido ? SIN_MOVIMIENTO : CON_MOVIMIENTO
}

/**
 * La preferencia del usuario, respetando `MotionConfig`.
 *
 * `useReducedMotionConfig` y no `useReducedMotion`: el segundo lee solo el media
 * query y no ve el contexto, con lo cual no se podría forzar en una comprobación.
 * Devuelve `null` cuando todavía no se resolvió; se trata como "no reducido",
 * que es el valor por defecto del sistema operativo.
 */
export function useMovimientoReducido(): boolean {
  return useReducedMotionConfig() ?? false
}
