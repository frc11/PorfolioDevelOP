import { RESENAS, TEXTO_DE_LAS_RESENAS, TITULO_DE_LAS_RESENAS, enlaceDelTrabajo } from './contenido'

/**
 * [NOCTURNO B2] LAS RESEÑAS PARA EL LECTOR Y EL TECLADO — las mismas en las dos ramas (el escenario y la lista), en el mismo lugar del
 * documento (después de los valores, antes del CTA): el título como `h3`, cada reseña entera y su enlace al trabajo. Lo que se VE (las
 * tarjetas del aro, que cambian de reseña en la nuca, y las del carrusel plano) es decoración para el lector y sólo se toca con el puntero.
 *
 * El texto va en `sr-only`; cada enlace también, salvo con el foco del teclado: ahí aparece como la pastilla de la barra, abajo y al medio
 * del cuadro (el gesto de «Saltar al contenido»): se recorren las reseñas con Tab y cada una dice adónde lleva.
 *
 * [C2-70t] También en la lista del teléfono, donde cada tarjeta lleva su botón «Ver trabajo» a la vista (del dedo y del puntero): la
 * parada del teclado de cada reseña es ésta. Una reseña sin trabajo en el Portfolio no lleva enlace.
 */
export function ResenasParaElLector(): React.JSX.Element {
  return (
    <div data-pieza="resenas-para-el-lector">
      <h3 className="sr-only">{`${TITULO_DE_LAS_RESENAS.izquierda} ${TITULO_DE_LAS_RESENAS.derecha}`}</h3>
      <ul className="list-none">
        {RESENAS.map((r) => {
          const enlace = enlaceDelTrabajo(r)
          return (
            <li key={r.clave}>
              <blockquote className="sr-only">
                <p>{r.cita}</p>
                <footer>{`${r.nombre}, ${r.negocio}`}</footer>
              </blockquote>
              {enlace !== undefined && (
                <a
                  href={enlace}
                  className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:bottom-[var(--spacing-8)] focus-visible:left-1/2 focus-visible:z-[var(--z-overlay)] focus-visible:-translate-x-1/2 focus-visible:rounded-[var(--radius-fuerte)] focus-visible:border focus-visible:border-borde focus-visible:bg-superficie-translucida focus-visible:px-[var(--spacing-4)] focus-visible:py-[var(--spacing-2)] focus-visible:text-cuerpo focus-visible:text-tinta focus-visible:shadow-flotante focus-visible:backdrop-blur-[var(--blur-panel)]"
                >
                  {TEXTO_DE_LAS_RESENAS.enlaceDelLector(r.nombre, r.negocio)}
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
