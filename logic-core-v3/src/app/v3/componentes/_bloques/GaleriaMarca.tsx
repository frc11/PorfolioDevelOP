import { Logotipo, MarcaLockup, PrefijoDeServicio, Separador } from '../../_componentes/marca/Marca'
import { Cuerpo } from '../../_componentes/tipografia/Textos'

import { Estado, Ficha } from './Ficha'

/**
 * LA MARCA EN TRES REGISTROS — logotipo, separador, prefijo (B3, Parte 2).
 *
 * ── Por qué se demuestra ACÁ y no en la home ──────────────────────────────
 *
 * Los tres registros son piezas de marca de este frente; dónde MONTARLOS en el
 * home vivo —la pastilla, el pie, el rótulo de sección— cae en `_secciones/` y en
 * la geometría medida de la pastilla, que son del sprint paralelo. La regla del
 * bloque es «no inventes lugares nuevos; si el sistema pide una aparición que hoy
 * no existe, frená y reportá». Así que las piezas se construyen y se VERIFICAN
 * acá, en el instrumento, y el reporte dice dónde tienen que entrar.
 *
 * Se muestran sobre papel y sobre la sección invertida, porque la regla del
 * acento (relleno sobre oscuro, nunca texto) sólo se ve con los dos fondos.
 */
export function GaleriaMarca() {
  return (
    <>
      <Ficha
        titulo="Marca · el sistema, no el símbolo"
        nota="Prefijo de servicio (relleno del acento) + logotipo + separador (regla de 1px). El objeto 3D es el cuarto registro y vive en la escena."
      >
        <Estado rotulo="lockup sobre papel (home: acento web)">
          <MarcaLockup>Ingeniería para negocios reales</MarcaLockup>
        </Estado>
        <Estado rotulo="lockup sobre la sección invertida — el acento va como RELLENO, nunca como texto">
          <div data-seccion="invertida" className="bg-fondo text-tinta p-[var(--spacing-4)]">
            <MarcaLockup>Ingeniería para negocios reales</MarcaLockup>
          </div>
        </Estado>
        <Estado rotulo="la firma mínima: prefijo + logotipo, sin continuación">
          <MarcaLockup />
        </Estado>
      </Ficha>

      <Ficha
        titulo="Marca · las piezas por separado"
        nota="Instrument Serif está PROPUESTA para el separador, como su única aparición del sitio. No se carga en este bloque (sin dependencias nuevas): hoy el separador es la regla del sistema."
      >
        <Estado rotulo="logotipo">
          <Logotipo />
        </Estado>
        <Estado rotulo="prefijo de servicio (relleno, se retiñe por data-servicio)">
          <span data-servicio="ia-automatizacion" className="inline-flex items-center gap-[var(--spacing-2)]">
            <PrefijoDeServicio />
            <Cuerpo como="span">verde en IA · azul en web · violeta en software</Cuerpo>
          </span>
        </Estado>
        <Estado rotulo="separador (regla de 1px, entre el logotipo y lo que sigue)">
          <span className="inline-flex h-[var(--spacing-8)] items-center gap-[var(--spacing-2)]">
            <Logotipo />
            <Separador />
            <Cuerpo como="span">lo que sigue</Cuerpo>
          </span>
        </Estado>
      </Ficha>
    </>
  )
}
