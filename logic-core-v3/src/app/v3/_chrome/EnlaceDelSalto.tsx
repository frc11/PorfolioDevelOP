'use client'

import { usePathname } from 'next/navigation'

import { ID_DEL_CONTENIDO_DE_PAGINA } from '../_componentes/pagina/atributoDeLaIntro'

/**
 * [M-INT] EL ENLACE DE SALTO, SEGÚN LA RUTA — el chrome lo monta el layout de `/v3` para todas las rutas, y `#hero` (la sección de
 * entrada del home) no existe en las páginas: ahí el salto no llevaba a ningún lado. En el home sigue yendo a la sección de entrada
 * (`delHome`, que le pasa `SaltarAlContenido` como texto para no traer `Panel` al cliente); fuera, a la primera pieza de la página
 * (`ID_DEL_CONTENIDO_DE_PAGINA`: la intro, la cabecera legal o la 404). Sin enrutador (un render de prueba), la ruta es la del home.
 * Las páginas no pueden llevar `id="hero"`: el «Home» de la barra y el deslizamiento lo buscan por id y harían scroll en la página.
 */
export function EnlaceDelSalto({ delHome, rotulo }: { readonly delHome: string; readonly rotulo: string }): React.JSX.Element {
  const ruta = usePathname()
  const enElHome = ruta === null || ruta === '/v3' || ruta === '/v3/'
  return (
    <a data-pieza="salto" href={`#${enElHome ? delHome : ID_DEL_CONTENIDO_DE_PAGINA}`} className="text-cuerpo tracking-texto leading-texto font-semi">
      {rotulo}
    </a>
  )
}
