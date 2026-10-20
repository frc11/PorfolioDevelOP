/**
 * [B12a.3] P-H29e · EL REGISTRO DE LAS VARIANTES — de un id a su módulo, con un import dinámico.
 *
 * Por qué un registro y no el componente en el preset: una página de servidor (`[servicio]/page.tsx`) no puede pasarle una función a un
 * componente de cliente, y el preset viaja de la página a la escena. Entonces el preset lleva el id (`PresetDeLaEscena.variante`) y la ranura
 * (`_lib/escena/ruta/RanuraDeLaVariante.tsx`) carga el componente de acá. El import dinámico deja cada variante en su propio pedazo: no entra
 * en la carga de la página ni en la del lienzo hasta que una página la pide.
 *
 * Vive fuera de `_lib/` a propósito: `_lib/` nunca importa nada de `_servicios/`, y este archivo es el único lugar del home que nombra a
 * las variantes de servicios. Cada servicio agrega SU línea (un id y su import) cuando monta su variante; el módulo exporta el componente
 * como `default`, desde un archivo `'use client'`.
 */
import type { ComponenteDeVariante } from '../_lib/escena/ruta/variante'

type CargaDeLaVariante = () => Promise<{ readonly default: ComponenteDeVariante }>

export const REGISTRO_DE_VARIANTES = {
  /** La de la ruta de prueba (`/v3/prueba-de-pagina`): ejerce la ranura entera (la luz de abajo, la energía, la salida). */
  prueba: () => import('../_lib/escena/ruta/VarianteDePrueba'),
} as const satisfies Readonly<Record<string, CargaDeLaVariante>>

export type IdDeVariante = keyof typeof REGISTRO_DE_VARIANTES

export const esIdDeVariante = (id: string): id is IdDeVariante => Object.hasOwn(REGISTRO_DE_VARIANTES, id)
