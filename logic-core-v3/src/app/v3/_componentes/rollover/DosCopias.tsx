/**
 * [INTERFAZ 1] T2 · EL ROLLOVER DE DOS COPIAS, para cualquier link o botón del home (COMPONENTS.md §3.3).
 *
 * El gesto medido en nk —y que ya hace el CTA (`chrome/Cta.tsx`, `cta.css`)— sacado del CTA para el texto de los demás
 * controles: una ventana que recorta, la copia A que sale girando 6° y subiendo, la copia B que entra desde 10° y abajo
 * con un barrido de `clip-path`. La geometría es la medida, en `em` (`rollover.css`): sirve a cualquier tamaño de texto.
 * Lo dispara el control que lo contiene (el `a` o el `button` más cercano), con el puntero fino o con el foco del
 * teclado. Entra animado y vuelve de un cuadro (la decisión de BOTON-1: el rótulo no se queda a mitad de camino).
 *
 * La copia B va `aria-hidden`: el nombre del control es el texto UNA vez (en nk el árbol de accesibilidad lee las dos
 * copias pegadas, «Explore PomeloExplore Pomelo»; no le agregamos ese defecto).
 *
 * El CTA no lo usa: tiene su propio gesto, con la ventana que crece y el subrayado (`chrome/` no se toca).
 */
export function DosCopias({ children }: { readonly children: string }): React.JSX.Element {
  return (
    <span data-rollover="">
      <span data-copia="a">{children}</span>
      <span data-copia="b" aria-hidden="true">
        {children}
      </span>
    </span>
  )
}
