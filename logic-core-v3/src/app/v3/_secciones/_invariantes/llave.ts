/**
 * ⚠️ EL ARNÉS DE LA LLAVE — lo que cada invariante de sección necesita para
 * seguir afirmando lo mismo que antes de B12 §4.
 *
 * ── El problema, en una línea ─────────────────────────────────────────────
 *
 * §4 mete veinte casillas de contenido INVENTADO detrás de
 * `CONTENIDO_INVENTADO`, y media docena de invariantes dicen «ni un dígito» o
 * «el marcador llega a la pantalla». Las dos cosas son ciertas a la vez, pero
 * hay que mirar el sitio correcto: **el que queda cuando la llave se apaga.**
 *
 * ── Las tres piezas, y por qué cada una ───────────────────────────────────
 *
 *   · **`SIN_LLAVE`** — el contenido con las mentiras devueltas a su marcador.
 *     Es lo que reciben los detectores de `marcadores.ts`, que recorren el DATO.
 *     Ninguna condición de ningún detector se tocó: cambió la entrada.
 *   · **`quietoSinLlave` / `animadoSinLlave`** — lo mismo sobre el marcado, con
 *     `sinLoInventadoEnMarcado`, que **empareja contra el texto visible y
 *     escribe en los nodos de texto**. Las dos trampas que eso cierra están
 *     medidas y escritas en `_contrato/restauracion.ts`: sobre el HTML crudo la
 *     casilla que vale `4` se come el `4` de un `gap-4`, y restaurando nodo por
 *     nodo no aparecen las frases que Servicios parte en un `<span>` por
 *     palabra.
 *   · **`escritoAMano`** — el que impide que todo esto sea circular. Filtra los
 *     hallazgos que la restauración NO cambia: un `12` tecleado en un
 *     `contenido.ts` no sale de ninguna casilla declarada, así que sobrevive al
 *     filtro y pone el invariante en rojo, igual que antes de §4.
 *
 * Sin la tercera, «cero dígitos después de restaurar» sería compatible con una
 * cifra fabricada al lado de las declaradas. Con ella, no.
 *
 * ⚠ Vive en `_invariantes/` porque es INSTRUMENTO: no lo importa una sola línea
 * de producto y no llega al navegador.
 */

import { afirmarIgual, controlPositivo } from '../../_lib/__tests__/afirmar'
import {
  hallazgosDeCifraConSimbolo,
  hallazgosDeDigito,
  hallazgosDeMarcadorDesconocido,
  numerosDe,
} from '../_contrato/marcadores'
import { sinLoInventadoEn, sinLoInventadoEnMarcado, sinLoInventado } from '../_contrato/restauracion'

/** Un hallazgo de los detectores de `marcadores.ts`: ruta y texto. */
interface HallazgoConTexto {
  readonly ruta: string
  readonly texto: string
}

/**
 * Los hallazgos que la restauración NO toca. Si llevan un dígito, se
 * escribieron a mano: no salieron de una casilla de `inventado.ts`.
 */
export function escritoAMano<T extends HallazgoConTexto>(hallazgos: readonly T[]): T[] {
  return hallazgos.filter((h) => sinLoInventado(h.texto) === h.texto)
}

export interface ConLaLlaveApagada {
  /** El contenido de la sección, con los marcadores de vuelta. */
  readonly SIN_LLAVE: unknown
  /** La rama quieta del marcado, con los marcadores de vuelta. */
  readonly quietoSinLlave: string
  /** La rama animada, igual. */
  readonly animadoSinLlave: string
}

/** Las tres vistas de una sección con la llave apagada, en una llamada. */
export function conLaLlaveApagada(
  contenido: unknown,
  quieto: string,
  animado: string,
): ConLaLlaveApagada {
  return {
    SIN_LLAVE: sinLoInventadoEn(contenido),
    quietoSinLlave: sinLoInventadoEnMarcado(quieto),
    animadoSinLlave: sinLoInventadoEnMarcado(animado),
  }
}

/**
 * ⚠️ LAS CUATRO CAPAS DE «EL CONTENIDO NO SE PUEDE LEER COMO UN DATO», JUNTAS.
 *
 * Números y Trabajos escribían este bloque cada uno por su lado, línea por
 * línea y con los mismos cuatro detectores. **Dos copias del mismo control se
 * desincronizan**, y B12 §4 lo demostró: cuando la llave entró, uno de los dos
 * quedó mirando el contenido crudo donde el otro miraba el restaurado. Acá va
 * una sola vez, y las dos secciones comprueban exactamente lo mismo.
 *
 * Las cuatro capas, y ninguna sobra:
 *
 *   1. **cifras con símbolo** — la forma exacta de la deuda de develOP;
 *   2. **cualquier dígito** — `12 proyectos` se lee como un hecho igual, y va
 *      contra el contenido RESTAURADO;
 *   3. **el dígito escrito a mano** — el pase no circular: un dígito que la
 *      restauración no cambia no salió de una casilla declarada;
 *   4. **hojas numéricas** —que van contra el contenido CRUDO, porque una
 *      casilla inventada es una cadena y nunca un número— y **marcadores fuera
 *      del conjunto cerrado**.
 *
 * Cada una con su control positivo, que corre la MISMA función contra una
 * entrada fabricada.
 */
export function afirmarQueElContenidoNoEsUnDato(contenido: unknown, sinLlave: unknown): void {
  afirmarIgual(hallazgosDeCifraConSimbolo(sinLlave).length, 0, 'cero cifras con símbolo')
  controlPositivo('el detector de cifras con símbolo ve un +340%', { a: 'crecimos +340%' }, (c) => hallazgosDeCifraConSimbolo(c).length === 0)
  afirmarIgual(hallazgosDeDigito(sinLlave).length, 0, 'cero dígitos, punto — con la llave apagada')
  afirmarIgual(escritoAMano(hallazgosDeDigito(contenido)).length, 0, `  ⚠️ y ninguno ESCRITO A MANO: los ${hallazgosDeDigito(contenido).length} dígitos de hoy salen de una casilla declarada`)
  controlPositivo('el detector de dígitos ve un 12 sin símbolo', { a: '12 proyectos' }, (c) => hallazgosDeDigito(c).length === 0)
  afirmarIgual(numerosDe(contenido).length, 0, 'cero hojas numéricas: nada que el escáner de cadenas no vea')
  controlPositivo('el detector de hojas numéricas ve un { clientes: 12 }', { clientes: 12 }, (c) => numerosDe(c).length === 0)
  afirmarIgual(hallazgosDeMarcadorDesconocido(sinLlave).length, 0, 'cero marcadores fuera del conjunto cerrado')
  controlPositivo('el detector de marcadores ve un [METRICA] sin tilde', { a: 'subimos [METRICA]' }, (c) => hallazgosDeMarcadorDesconocido(c).length === 0)
}
