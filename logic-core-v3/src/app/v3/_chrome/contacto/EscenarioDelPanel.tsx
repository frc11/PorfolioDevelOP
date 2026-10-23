import { CLASES_DEL_ESCENARIO_DEL_PANEL } from './panel'

/**
 * [C2 · 22] EL ESCENARIO DEL PANEL — el cuadro que centra a la hoja del contacto abajo de escritorio (`panel.ts`). Apagado (la placa de
 * escritorio, la hoja de arriba con movimiento reducido) es transparente: devuelve a sus hijos tal cual, como `PlacaDelContacto`.
 * No recibe el puntero: un clic al lado de la hoja cae en el velo, que cierra. No anima nada: la entrada y la salida son de la hoja.
 */
export function EscenarioDelPanel({ activo, children }: { readonly activo: boolean; readonly children: React.ReactNode }): React.JSX.Element {
  if (!activo) return <>{children}</>
  return (
    <div data-parte="escenario-del-panel" className={CLASES_DEL_ESCENARIO_DEL_PANEL}>
      {children}
    </div>
  )
}
