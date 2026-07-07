'use client'

import { createContext, useContext } from 'react'

/**
 * Contexto que `Field` provee a los controles del kit (Input, TextArea, Select)
 * para asociarlos con su label y su mensaje de error/ayuda SIN tocar cada call
 * site. Los controles leen estos valores solo como FALLBACK: cualquier prop
 * explícita del caller (id, aria-describedby, aria-invalid) gana. Fuera de un
 * `Field` el contexto es null → los controles se comportan igual que siempre.
 */
export interface FieldControlContext {
  /** id del control, apareado con el `htmlFor` del label del Field. */
  controlId?: string
  /** id del `<p>` de error (si hay) o de ayuda, para `aria-describedby`. */
  describedBy?: string
  /** true cuando el Field tiene error — alimenta `aria-invalid`, no el color. */
  invalid?: boolean
}

const FieldControlCtx = createContext<FieldControlContext | null>(null)

export const FieldControlProvider = FieldControlCtx.Provider

/** Devuelve el contexto del `Field` contenedor, o un objeto vacío si no hay. */
export function useFieldControl(): FieldControlContext {
  return useContext(FieldControlCtx) ?? {}
}
