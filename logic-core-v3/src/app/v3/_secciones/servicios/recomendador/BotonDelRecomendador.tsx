'use client'

import { ContenidoDelCta } from '../../../_componentes/chrome/Cta'

/**
 * [C2-51] UN BOTÓN CON EL EFECTO DE LOS CTA DEL SITIO, QUE HACE ALGO AL TOCARLO («Atrás», «Empezar de nuevo») — `Cta` no recibe un
 * `onClick` (es de formulario o de enlace), así que se arma como `EnlaceDelServicio` arma el suyo: el contenido del CTA
 * (`ContenidoDelCta`, el rollover de dos copias y su subrayado) con los atributos que lee `cta.css`. No es una copia del efecto.
 */
export function BotonDelRecomendador({ rotulo, alTocar, parte }: { readonly rotulo: string; readonly alTocar: () => void; readonly parte: string }): React.JSX.Element {
  return (
    <button type="button" onClick={alTocar} data-pieza="cta" data-variante="linea" data-registro="cuerpo" data-parte={parte} className="text-base">
      <ContenidoDelCta rotulo={rotulo} />
    </button>
  )
}
