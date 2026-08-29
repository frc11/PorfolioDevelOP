'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { useEpocaDeMedicion } from './epoca'
import { agruparEnLineas, lineaUnica, palabrasDe } from './lineas'

/**
 * LA MEDICIÓN DE LÍNEAS — dos fases, y por qué no hay una sola.
 *
 * ── El problema, que no es obvio ───────────────────────────────────────────
 *
 * Una vez que el texto está partido, **ya no se puede volver a medir sobre él**.
 * Cada línea vive en su propio contenedor de bloque, así que al angostar la
 * ventana el texto no refluye como un párrafo: refluye DENTRO de cada
 * contenedor, y las palabras que deberían pasar a la línea siguiente se quedan
 * en la suya. Medir ahí devuelve un agrupamiento que parece razonable y es
 * falso.
 *
 * Por eso hay dos fases y se vuelve a la primera en cada época:
 *
 *   `midiendo` — las palabras en un flujo plano, como un párrafo cualquiera.
 *                Es el reflujo REAL del navegador y es lo único que se mide.
 *   `listo`    — un contenedor por línea, con `overflow: hidden`, y adentro el
 *                elemento que se transforma.
 *
 * Es exactamente lo que hace SplitText: revertir al original y volver a partir.
 * Reproducimos el comportamiento, no la librería.
 *
 * La fase `midiendo` se pinta con `visibility: hidden` —conserva el layout, que
 * es lo único que hace falta para medir— así que no hay un cuadro de texto sin
 * estilar antes de la partición.
 *
 * ── Por qué `offsetTop` y no `getBoundingClientRect()` ─────────────────────
 *
 * Porque `getBoundingClientRect()` **incluye las transformadas** y este sistema
 * las tiene puestas justo encima del texto que quiere medir. Es una lección ya
 * pagada en este repo: con transformaciones activas el rect devuelve
 * coordenadas que no son las del layout.
 *
 * `offsetTop` es un valor de layout: no lo tocan las transformadas. Y se lee
 * contra el ancestro POSICIONADO más cercano, que acá es el contenedor del
 * bloque (`position: relative`), no el contenedor de línea (estático). Así el
 * número significa lo mismo en las dos fases.
 *
 * ── Cuántas mediciones, y de qué tamaño ────────────────────────────────────
 *
 * Una por época y por bloque. Dentro de una medición, los `offsetTop` de las N
 * palabras se leen en un solo recorrido **sin escribir nada en el medio**, así
 * que el navegador resuelve el layout UNA vez y las N lecturas caen sobre ese
 * mismo resultado: es una medición, no N.
 *
 * ── Cero `setState` ────────────────────────────────────────────────────────
 *
 * El agrupamiento vive en un registro por instancia y se lee con
 * `useSyncExternalStore`. Es la misma decisión que tomó S1 en `useAnchoMinimo`:
 * cuando el dato viene de afuera de React —acá, del layout del navegador— ése es
 * el hook que corresponde, y de paso no aparece `set-state-in-effect`.
 *
 * El registro se crea con `useState(crear)` y su setter no se usa nunca: es el
 * modismo de constante perezosa. Guardarlo en un `ref` sería equivalente salvo
 * por un detalle que importa: **leer `ref.current` durante el render está
 * prohibido** (`react-hooks/refs`), y el registro hay que leerlo justamente ahí.
 */

export type FaseDeLineas = 'midiendo' | 'listo'

export interface EstadoDeLineas {
  readonly fase: FaseDeLineas
  /** Agrupamiento medido, o `null` si todavía no se midió en esta época. */
  readonly lineas: readonly (readonly number[])[] | null
  /** La época en la que se tomó este agrupamiento. −1 = todavía ninguno. */
  readonly epocaMedida: number
}

interface RegistroDeLineas {
  suscribir: (alCambiar: () => void) => () => void
  leer: () => EstadoDeLineas
  aMedir: () => void
  publicar: (lineas: readonly (readonly number[])[], epoca: number) => void
}

/**
 * El registro no sabe cuántas palabras hay, y es a propósito: así no hay que
 * rehacerlo cuando el texto cambia, y el estado inicial es una constante.
 */
function crearRegistroDeLineas(): RegistroDeLineas {
  let estado: EstadoDeLineas = { fase: 'midiendo', lineas: null, epocaMedida: -1 }
  const oyentes = new Set<() => void>()

  const avisar = (): void => {
    for (const oyente of oyentes) oyente()
  }

  return {
    suscribir(alCambiar) {
      oyentes.add(alCambiar)
      return () => {
        oyentes.delete(alCambiar)
      }
    },
    leer() {
      return estado
    },
    aMedir() {
      if (estado.fase === 'midiendo') return
      estado = { fase: 'midiendo', lineas: null, epocaMedida: estado.epocaMedida }
      avisar()
    },
    publicar(lineas, epoca) {
      estado = { fase: 'listo', lineas, epocaMedida: epoca }
      avisar()
    },
  }
}

export interface LineasMedidas {
  /** Las palabras del texto, ya normalizadas. */
  readonly palabras: readonly string[]
  /** Índices de palabra agrupados por línea visual. */
  readonly lineas: readonly (readonly number[])[]
  /** Si estamos en la fase plana: el bloque se pinta con `visibility: hidden`. */
  readonly midiendo: boolean
  /** Va en el contenedor del bloque, que tiene que ser `position: relative`. */
  readonly refContenedor: React.RefObject<HTMLDivElement | null>
  /** Va en cada palabra de la fase plana. */
  readonly guardarPalabra: (indice: number) => (elemento: HTMLElement | null) => void
}

export function useLineasMedidas(texto: string): LineasMedidas {
  const palabras = useMemo(() => palabrasDe(texto), [texto])

  const refContenedor = useRef<HTMLDivElement | null>(null)
  const refPalabras = useRef<(HTMLElement | null)[]>([])

  // Constante perezosa: el registro se crea una vez y el setter nunca se usa.
  const [registro] = useState(crearRegistroDeLineas)

  const suscribir = useCallback(
    (alCambiar: () => void) => registro.suscribir(alCambiar),
    [registro],
  )
  const leer = useCallback(() => registro.leer(), [registro])
  const estado = useSyncExternalStore(suscribir, leer, leer)

  const foto = useEpocaDeMedicion()

  useEffect(() => {
    // Un alto de viewport en cero es el corte de servidor o una pestaña oculta.
    // Medir ahí no da un número impreciso: da cero.
    if (foto.alto === 0) return

    if (estado.fase === 'listo') {
      // Época nueva: volver al flujo plano. La medición ocurre en la pasada
      // siguiente, cuando el DOM ya es el que se puede medir.
      if (estado.epocaMedida !== foto.epoca) registro.aMedir()
      return
    }

    const elementos = refPalabras.current
    if (elementos.length < palabras.length) return

    // Un solo recorrido de lectura, sin una sola escritura en el medio: el
    // navegador resuelve el layout una vez.
    const topes: number[] = []
    for (let i = 0; i < palabras.length; i++) {
      const elemento = elementos[i]
      if (elemento === null || elemento === undefined) return
      topes.push(elemento.offsetTop)
    }

    registro.publicar(agruparEnLineas(topes), foto.epoca)
  }, [estado, foto, palabras, registro])

  const guardarPalabra = useCallback(
    (indice: number) => (elemento: HTMLElement | null) => {
      refPalabras.current[indice] = elemento
    },
    [],
  )

  return {
    palabras,
    // Antes de la primera medición, todas las palabras son una sola línea. Es el
    // estado que corresponde: no hay corte conocido, así que no se inventa uno.
    lineas: estado.lineas ?? lineaUnica(palabras.length),
    midiendo: estado.fase === 'midiendo',
    refContenedor,
    guardarPalabra,
  }
}
