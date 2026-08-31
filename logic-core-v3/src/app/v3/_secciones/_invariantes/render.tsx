import type { ReactNode } from 'react'

import { MotionConfig } from 'motion/react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ProveedorDeCoreografia } from '../_contrato/coreografia'
import { PRIMITIVAS_ANIMADAS } from '../_contrato/coreografia-animada'

/**
 * RENDERIZAR LAS DOS RAMAS EN EL MISMO PROCESO, SIN NAVEGADOR.
 *
 * ── Por qué esto existe, y por qué está una sola vez ──────────────────────
 *
 * Todas las afirmaciones de este proyecto sobre lo que se ve son sobre el
 * MARCADO que sale, no sobre la intención del componente. Y las dos ramas hacen
 * falta porque **cada una sola miente**:
 *
 *   · "abajo de 1025 no se escribe ninguna transformada" pasa en verde si el
 *     sistema no anima NUNCA. El control es la rama animada, donde la
 *     transformada tiene que estar;
 *   · "el contenido llega completo" pasa en verde si el marcado está vacío. El
 *     control es contar y exigir que sean más de cero.
 *
 * Los dos lanes lo resolvieron distinto y los dos lo resolvieron bien para su
 * arquitectura: el lane A con un `ProveedorDeCoreografia modo="siempre|nunca"`,
 * el lane B con una propiedad `anima` en cada sección. **Con la compuerta
 * resuelta arriba las dos sobran**, y lo que queda es más simple que las dos:
 * la rama la decide si las primitivas animadas están instaladas o no, que es
 * exactamente lo que decide en producción. Un instrumento que forzara otra cosa
 * estaría midiendo un tercer estado que nadie sirve.
 *
 * ⚠ **No hay atributo de forzado en el producto.** La sección no sabe si anima
 * y no tiene cómo saberlo: es el proveedor el que cambia, desde afuera.
 *
 * ── Lo que un render de servidor NO puede mostrar, y hay que decirlo ──────
 *
 * En un render de servidor no corren los efectos, así que **P1 sale en su fase
 * de medición**: texto plano, sin transformada. El divisor de líneas mide en un
 * efecto y recién después parte. Por eso "se escribe una transformada" se
 * controla con los bloques P2, que sí la escriben en el primer cuadro, y P1 se
 * comprueba por su atributo, que sí cambia entre las dos ramas.
 */

export interface OpcionesDeMarcado {
  /** Si se instalan las primitivas animadas. */
  readonly anima: boolean
  /**
   * La preferencia de movimiento reducido que `MotionConfig` fuerza.
   *
   * Es el asiento que hace verificable la política de S2 sin navegador: con
   * `'always'` el sistema de motion se comporta como si la persona la tuviera
   * puesta, en el mismo proceso y en el mismo render.
   */
  readonly preferencia?: 'always' | 'never'
}

export function marcar(nodo: ReactNode, { anima, preferencia = 'never' }: OpcionesDeMarcado): string {
  return renderToStaticMarkup(
    <MotionConfig reducedMotion={preferencia}>
      <ProveedorDeCoreografia primitivas={anima ? PRIMITIVAS_ANIMADAS : null}>
        {nodo}
      </ProveedorDeCoreografia>
    </MotionConfig>,
  )
}

/** La rama que se sirve: abajo de 1025, y con la preferencia puesta. */
export const marcarQuieto = (nodo: ReactNode): string => marcar(nodo, { anima: false })

/** La rama animada: arriba del umbral y sin preferencia. */
export const marcarAnimado = (nodo: ReactNode): string => marcar(nodo, { anima: true })
