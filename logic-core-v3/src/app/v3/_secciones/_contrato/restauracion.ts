/**
 * ⚠️ DEVOLVER LOS MARCADORES — la restauración, del otro lado de la llave.
 *
 * `inventado.ts` tiene la lista de mentiras y la única puerta que las escribe
 * (`conLlave`). Acá está la operación inversa: **dado un texto que hoy lleva
 * cifras inventadas, devolverlo a como queda cuando la llave se apaga.**
 *
 * ── Por qué es un archivo aparte ──────────────────────────────────────────
 *
 * Por las 300 líneas, sí, pero el corte no es arbitrario y conviene leerlo:
 * son **los dos lados de la llave**. La lista y `conLlave` los usa el PRODUCTO
 * —las ocho secciones—; todo lo de acá lo usan los INSTRUMENTOS, para escanear
 * y para contar marcadores. Nada de este archivo llega al navegador.
 *
 * ── Qué compra, y es todo el diseño de §4 ────────────────────────────────
 *
 * Que **el escáner no se afloje**. Los detectores de `escaneo.ts` y de
 * `marcadores.ts` no cambiaron ni una condición: lo que cambia es que reciben
 * el texto restaurado, o sea el sitio real. Una cifra escrita a mano —que no
 * está en la lista cerrada— llega entera al detector y lo pone en rojo.
 */

import type { Invento } from './inventado'
import { LISTA_DE_INVENTOS } from './inventado'

/** Los caracteres que hay que escapar para meter un literal en una expresión. */
const RESERVADOS = /[.*+?^${}()|[\]\\]/g

/**
 * ⚠️ EL LÍMITE DE LA SUSTITUCIÓN — por qué no alcanza con buscar la cadena.
 *
 * Dos de las casillas de Números son **un número solo**: `4` y `9`. Buscados
 * como subcadena, el `4` de `de 3 a 14 consultas por semana` —que es OTRA
 * casilla— se convertiría en `1[CIFRA]`, y la restauración pasaría a depender
 * de en qué orden está escrita la lista.
 *
 * Así que la mentira se busca **entre límites de letra o número**: si empieza
 * con letra o dígito, lo de antes no puede serlo; si termina con letra o dígito,
 * lo de después tampoco. `\b` de toda la vida, pero escrito con `\p{L}\p{N}`
 * porque las nuestras llevan tildes y el `\b` de JavaScript corta en la `á`.
 *
 * Lo que esto compra, y es lo que importa: **la sustitución quita MENOS, no
 * más.** Toda duda se resuelve hacia el lado de que el escáner vea el texto.
 */
function expresionDe(mentira: string): RegExp {
  const cuerpo = mentira.replace(RESERVADOS, '\\$&')
  const antes = /^[\p{L}\p{N}]/u.test(mentira) ? '(?<![\\p{L}\\p{N}])' : ''
  const despues = /[\p{L}\p{N}]$/u.test(mentira) ? '(?![\\p{L}\\p{N}])' : ''
  return new RegExp(`${antes}${cuerpo}${despues}`, 'gu')
}

/**
 * ¿Esta mentira se está leyendo en este texto? Con el MISMO límite con el que se
 * sustituye — preguntarlo con `includes` diría que la casilla que vale `4` se ve
 * adentro de «de 3 a 14 consultas», que es otra casilla.
 */
export function apareceEn(texto: string, invento: Invento): boolean {
  return expresionDe(invento.mentira).test(texto)
}

/**
 * ⚠️ LA RESTAURACIÓN — un texto cualquiera, con las mentiras devueltas a su
 * marcador. Es «el sitio como queda cuando la llave se apaga», calculado sobre
 * el texto que HOY se renderiza.
 *
 * Es lo que hace que el escáner **no se afloje**: los detectores no cambian ni
 * una condición, y lo que reciben es el texto real. Lo que no está en la lista
 * cerrada no se toca — una cifra escrita a mano sigue llegando entera al
 * detector y lo sigue poniendo en rojo.
 *
 * ⚠ Se reemplaza de la mentira MÁS LARGA a la más corta. Con dos casillas donde
 * una empieza como la otra, el orden de la lista decidiría el resultado. El
 * invariante además prohíbe que una mentira matchee adentro de otra, así que el
 * orden es una segunda barrera y no la única.
 */
export function sinLoInventado(
  texto: string,
  inventos: readonly Invento[] = LISTA_DE_INVENTOS,
): string {
  let salida = texto
  for (const i of [...inventos].sort((a, b) => b.mentira.length - a.mentira.length)) {
    salida = salida.replace(expresionDe(i.mentira), i.pedido)
  }
  return salida
}

/** Un tramo del texto visible que hay que reemplazar, y por qué texto. */
interface Edicion {
  readonly ini: number
  readonly fin: number
  readonly pedido: string
}

/**
 * La juntura entre dos nodos de texto. Es un carácter que no es letra ni número
 * —así que los límites de palabra lo tratan como separador— y que no puede
 * aparecer en el marcado. Sin él, concatenar los nodos pega `23` con
 * `Proyectos` y la casilla deja de encontrarse por su propio límite de palabra.
 */
const JUNTURA = '\x00'

/** La expresión de una mentira sobre el texto CONCATENADO: entre palabra y
 *  palabra puede haber junturas además de espacios, que es lo que queda cuando
 *  el renderizador envuelve cada palabra en su `<span>`. */
function expresionEnPartes(mentira: string): RegExp {
  const palabras = mentira.split(/\s+/).map((p) => p.replace(RESERVADOS, '\\$&'))
  const antes = /^[\p{L}\p{N}]/u.test(mentira) ? '(?<![\\p{L}\\p{N}])' : ''
  const despues = /[\p{L}\p{N}]$/u.test(mentira) ? '(?![\\p{L}\\p{N}])' : ''
  return new RegExp(`${antes}${palabras.join(`[\\s${JUNTURA}]+`)}${despues}`, 'gu')
}

/** Los tramos a devolver, sin superponerse: gana la mentira más larga. */
function edicionesDe(texto: string, inventos: readonly Invento[]): Edicion[] {
  const ediciones: Edicion[] = []
  for (const i of [...inventos].sort((a, b) => b.mentira.length - a.mentira.length)) {
    for (const m of texto.matchAll(expresionEnPartes(i.mentira))) {
      const ini = m.index
      const fin = ini + m[0].length
      if (ediciones.some((e) => ini < e.fin && e.ini < fin)) continue
      ediciones.push({ ini, fin, pedido: i.pedido })
    }
  }
  return ediciones.sort((a, b) => a.ini - b.ini)
}

/**
 * ⚠️ LA MISMA RESTAURACIÓN SOBRE MARCADO — y las DOS trampas que tiene, las dos
 * medidas sobre este home.
 *
 *   1. **Corriendo `sinLoInventado` sobre el HTML crudo**, la casilla de Números
 *      que vale `4` se come el `4` de `class="gap-4"` y el de `col-start-3`.
 *      Medido: cinco `[CIFRA]` esperados contra NUEVE encontrados. Una clase de
 *      Tailwind no es contenido.
 *   2. **Y restaurando cada nodo de texto por separado**, las mentiras que
 *      ocupan más de una palabra no aparecen: Servicios envuelve **cada palabra
 *      en su propio `<span>`** para poder animarlas, así que la frase inventada
 *      llega al marcado partida en veinte pedazos. Medido: el censo de
 *      `s10-acceso` devolvía 34 marcadores donde hay 40, y los seis que faltaban
 *      eran los tres párrafos de Servicios.
 *
 * Las dos se cierran con la misma idea: **el emparejamiento se hace contra el
 * TEXTO VISIBLE —los nodos de texto concatenados, sin una sola etiqueta
 * adentro— y la escritura vuelve a los nodos de texto, dejando las etiquetas
 * intactas.** Una mentira partida en `<span>`s se encuentra entera porque los
 * `<span>`s no están en el texto que se mira; una clase nunca participa porque
 * vive adentro de una etiqueta.
 *
 * El pedido se escribe en el primer nodo del tramo y los siguientes quedan
 * vacíos. La estructura no cambia: los mismos elementos, con el texto devuelto.
 */
export function sinLoInventadoEnMarcado(
  html: string,
  inventos: readonly Invento[] = LISTA_DE_INVENTOS,
): string {
  const partes = html.split(/(<[^>]*>)/)
  const texto = partes.filter((_, i) => i % 2 === 0).join(JUNTURA)
  const ediciones = edicionesDe(texto, inventos)
  if (ediciones.length === 0) return html

  let salida = ''
  let cursor = 0
  let siguiente = 0
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 1) {
      salida += partes[i]
      continue
    }
    const desde = cursor
    /** `+ 1` por la juntura que `join` puso después de este nodo. */
    cursor += partes[i].length + 1
    let escrito = ''
    for (let p = desde; p < cursor - 1; p++) {
      while (siguiente < ediciones.length && p >= ediciones[siguiente].fin) siguiente += 1
      const e = ediciones[siguiente]
      if (e === undefined || p < e.ini) {
        escrito += texto[p]
        continue
      }
      if (p === e.ini) escrito += e.pedido
    }
    salida += escrito
  }
  return salida
}

/**
 * La misma restauración sobre un CONTENIDO, hoja por hoja.
 *
 * Los detectores de `marcadores.ts` recorren el dato y no el texto —un
 * `{ activos: 50 }` no lo ve un escáner de cadenas— así que necesitan la
 * versión restaurada del objeto, no de su marcado. Recorre igual que
 * `textosDe`: objetos y arreglos, y devuelve lo demás como está.
 */
export function sinLoInventadoEn(
  valor: unknown,
  inventos: readonly Invento[] = LISTA_DE_INVENTOS,
): unknown {
  if (typeof valor === 'string') return sinLoInventado(valor, inventos)
  if (Array.isArray(valor)) return valor.map((v) => sinLoInventadoEn(v, inventos))
  if (typeof valor === 'object' && valor !== null) {
    return Object.fromEntries(
      Object.entries(valor).map(([clave, v]) => [clave, sinLoInventadoEn(v, inventos)]),
    )
  }
  return valor
}
