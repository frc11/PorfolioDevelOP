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
 *
 * ⚠️ **Y aun con las dos mitades eso probaba el ARNÉS, no el sitio.** El
 * instrumento renderizaba a través de `<MotionConfig reducedMotion={preferencia}>`
 * y después afirmaba sobre esa misma `preferencia`: inyectaba el valor bajo
 * prueba. Estuvo en verde —46 afirmaciones, 0 fallas— **mientras el sitio
 * ignoraba la preferencia**. De ahí sale la regla «verde por arnés» del
 * proyecto, y de ahí sale la segunda mitad que B7 le agregó (R7·R8·R9·R10):
 * afirmar, por un camino distinto, que **el camino de producción produce esa
 * entrada**. Las R1…R6 valen y se conservan enteras: prueban el mecanismo.
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
 * ── ⚠️ ESTE DOCBLOQUE ESTABA AL REVÉS, Y LA CAUSA SE ESCRIBE ACÁ ──────────
 *
 * Decía, textual: *«`useReducedMotionConfig` y no `useReducedMotion`: el segundo
 * lee solo el media query y no ve el contexto, con lo cual no se podría forzar
 * en una comprobación.»* La frase era cierta y la conclusión era falsa, porque
 * le faltaba la otra mitad: **`useReducedMotionConfig` tampoco lee el media
 * query si nadie pone el contexto**, y nadie lo ponía. El default de
 * `MotionConfigContext` es `reducedMotion: "never"`, que corta ANTES de mirar
 * la preferencia:
 *
 *     if (reducedMotion === "never")  return false        ← cortaba acá
 *     else if (reducedMotion === "always") return true
 *     else return reducedMotionPreference                 ← nunca se llegaba
 *
 * Resultado medido (B7 · Fase 0, 1920, preferencia emulada por CDP y verificada
 * con `matchMedia` desde la página): **2450 transformadas acumuladas con la
 * preferencia y 2450 sin ella.** Se eligió testeabilidad y se perdió la
 * función. Queda dicho.
 *
 * ── Y la otra frase que estaba al revés, en `CompuertaDelHome.tsx` ────────
 *
 * Ahí dice *«Usar otro hook para la misma preferencia sería tener dos
 * políticas»*. Ya había dos: la de `MotionConfig` (default `"never"`, que no
 * llegaba) y la de `_lib/usePrefiereMenosMovimiento` (que sí llega, y de la que
 * leen el cursor y el scroll suave). La que no llegaba era la del sistema de
 * motion. **El arreglo fue unificar hacia la que ya funciona, no escribir una
 * tercera**: `_lib/motion/ProveedorDeMovimiento.tsx` toma
 * `usePrefiereMenosMovimiento()` y lo expresa en el vocabulario de
 * `MotionConfig`. Este hook NO cambió una línea: le llegó la entrada.
 * (La corrección del docblock de `CompuertaDelHome.tsx` queda pendiente: ese
 * archivo está fuera de la zona de escritura del frente que hizo el arreglo.)
 *
 * Devuelve `null` cuando todavía no se resolvió; se trata como "no reducido",
 * que es el valor por defecto del sistema operativo. Con el proveedor montado
 * ese `null` ya no puede aparecer en `/v3`: el contexto siempre trae `'always'`
 * o `'never'`, y las dos ramas devuelven un booleano sin consultar nada más.
 */
export function useMovimientoReducido(): boolean {
  return useReducedMotionConfig() ?? false
}
