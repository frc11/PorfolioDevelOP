import { ArrowRight, ArrowUpRight, Instagram, Linkedin, Mail } from 'lucide-react'

import { FormularioDeNovedades } from '../../_componentes/chrome/Novedades'
import {
  BloqueDeColumnasDelPie,
  Pie,
  TituloDeCierreDelPie,
} from '../../_componentes/chrome/Pie'
import {
  BotonSocialDelPie,
  EnlaceDeContactoDelPie,
  EnlaceDelPieConIcono,
  EnlaceDeTextoDelPie,
} from '../../_componentes/chrome/PiePiezas'
import { Cuerpo, EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'

import { Estado, Ficha } from './Ficha'

/**
 * EL PIE — sus cinco piezas, sus estados, y el pie armado en las dos
 * superficies.
 *
 * ── Los textos son marcadores de posición ────────────────────────────────
 *
 * "Trabajos", "Escribinos", una dirección que no existe. No hay contenido
 * todavía y no se inventa: lo que se está construyendo es la caja y el estado,
 * no lo que dice.
 *
 * ── Los iconos entran por prop ────────────────────────────────────────────
 *
 * Ninguna pieza trae uno adentro. Acá los pone la galería, con `lucide-react`,
 * que ya es dependencia del repo. El tamaño va por token —`--spacing-4` son
 * 16px, el tamaño de icono de sección de la convención— y no por el atributo
 * `size`, para que ni el icono se salga del sistema.
 */

const CLASE_ICONO = 'size-[var(--spacing-4)]'

export function GaleriaPie() {
  return (
    <>
      <Ficha
        titulo="Link del pie con icono · 42 apariciones"
        nota="El icono se adelanta --spacing-1 en 0,5s con --ease-principal."
      >
        <Estado rotulo="vivo">
          <EnlaceDelPieConIcono
            href="#trabajos"
            rotulo="Trabajos"
            icono={<ArrowUpRight className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
          />
        </Estado>
        <Estado rotulo="hover, forzado">
          <EnlaceDelPieConIcono
            href="#trabajos"
            rotulo="Trabajos"
            forzado="hover"
            icono={<ArrowUpRight className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
          />
        </Estado>
        <Estado rotulo="foco, forzado">
          <EnlaceDelPieConIcono
            href="#trabajos"
            rotulo="Trabajos"
            forzado="foco"
            icono={<ArrowUpRight className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
          />
        </Estado>
      </Ficha>

      <Ficha
        titulo="Botón social · 21 apariciones"
        nota="Sólo icono, así que su nombre accesible va en aria-label y es obligatorio en el tipo. El hover usa --color-superficie-3, que el sistema declara como la superficie de estado activo."
      >
        <Estado rotulo="vivo">
          <BotonSocialDelPie
            href="#instagram"
            rotulo="Instagram"
            icono={<Instagram className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
          />
          <BotonSocialDelPie
            href="#linkedin"
            rotulo="LinkedIn"
            icono={<Linkedin className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
          />
        </Estado>
        <Estado rotulo="hover, forzado">
          <BotonSocialDelPie
            href="#instagram"
            rotulo="Instagram"
            forzado="hover"
            icono={<Instagram className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
          />
        </Estado>
        <Estado rotulo="foco, forzado">
          <BotonSocialDelPie
            href="#linkedin"
            rotulo="LinkedIn"
            forzado="foco"
            icono={<Linkedin className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
          />
        </Estado>
      </Ficha>

      <Ficha
        titulo="Link de contacto · text.titulo-s"
        nota="Los cinco tokens medidos: text.titulo-s, leading.titulo, tracking.texto, duracion.rapida y ease.principal."
      >
        <Estado rotulo="vivo">
          <EnlaceDeContactoDelPie href="#contacto" rotulo="Escribinos" />
        </Estado>
        <Estado rotulo="hover, forzado">
          <EnlaceDeContactoDelPie href="#contacto" rotulo="Escribinos" forzado="hover" />
        </Estado>
        <Estado rotulo="foco, forzado">
          <EnlaceDeContactoDelPie href="#contacto" rotulo="Escribinos" forzado="foco" />
        </Estado>
      </Ficha>

      <Ficha
        titulo="Link de texto inline · 12 apariciones"
        nota="El de la referencia computa 17px, que no es ninguno de los ocho niveles: acá hereda el de su párrafo y el huérfano desaparece."
      >
        <Estado rotulo="vivo, dentro de un párrafo">
          <Cuerpo>
            Un párrafo de cuerpo con un{' '}
            <EnlaceDeTextoDelPie href="#aviso">enlace inline</EnlaceDeTextoDelPie> adentro, para
            ver que hereda el tamaño.
          </Cuerpo>
        </Estado>
        <Estado rotulo="hover, forzado">
          <Cuerpo>
            Un párrafo con un{' '}
            <EnlaceDeTextoDelPie href="#aviso" forzado="hover">
              enlace inline
            </EnlaceDeTextoDelPie>{' '}
            en hover.
          </Cuerpo>
        </Estado>
      </Ficha>

      <Ficha
        titulo="Formulario de novedades"
        nota="El único lugar del sprint donde deshabilitado aplica de verdad. La etiqueta es un <label> real: un placeholder desaparece al escribir y no es un nombre."
      >
        <Estado rotulo="vivo">
          <FormularioDeNovedades
            id="novedades-vivo"
            placeholder="nombre@dominio.com"
            textoDeAyuda="Sin destino todavía: este sprint no toca base de datos."
            rotuloDeEnvio="Suscribirme"
            icono={<ArrowRight className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
          />
        </Estado>
        <Estado rotulo="foco, forzado">
          <FormularioDeNovedades
            id="novedades-foco"
            placeholder="nombre@dominio.com"
            rotuloDeEnvio="Suscribirme"
            forzado="foco"
            icono={<ArrowRight className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
          />
        </Estado>
        <Estado rotulo="deshabilitado">
          <FormularioDeNovedades
            id="novedades-off"
            placeholder="nombre@dominio.com"
            rotuloDeEnvio="Suscribirme"
            deshabilitado
            icono={<ArrowRight className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
          />
        </Estado>
      </Ficha>

      <Ficha
        titulo="El pie armado · las dos superficies"
        nota="`invertido` no pinta un color: escribe data-seccion=invertida, y el bloque de S0 da vuelta fondo, tinta, bordes y el anillo de foco de una sola vez."
      >
        <Estado rotulo="papel">
          <PieDeMuestra />
        </Estado>
        <Estado rotulo="invertido">
          <PieDeMuestra invertido />
        </Estado>
      </Ficha>
    </>
  )
}

function PieDeMuestra({ invertido = false }: { readonly invertido?: boolean }) {
  return (
    <div className="border-borde w-full border">
      <Pie invertido={invertido}>
        <BloqueDeColumnasDelPie>
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <EtiquetaDeSeccion como="h4" sangria={false}>
              Sitio
            </EtiquetaDeSeccion>
            <EnlaceDelPieConIcono
              href="#trabajos"
              rotulo="Trabajos"
              icono={<ArrowUpRight className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
            />
            <EnlaceDelPieConIcono
              href="#servicios"
              rotulo="Servicios"
              icono={<ArrowUpRight className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
            />
          </div>
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <EtiquetaDeSeccion como="h4" sangria={false}>
              Contacto
            </EtiquetaDeSeccion>
            <EnlaceDeContactoDelPie href="#contacto" rotulo="Escribinos" />
            <div className="flex gap-[var(--spacing-2)]">
              <BotonSocialDelPie
                href="#instagram"
                rotulo="Instagram"
                icono={<Instagram className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
              />
              <BotonSocialDelPie
                href="#correo"
                rotulo="Correo"
                icono={<Mail className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
              />
            </div>
          </div>
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <EtiquetaDeSeccion como="h4" sangria={false}>
              Novedades
            </EtiquetaDeSeccion>
            <FormularioDeNovedades
              id={invertido ? 'pie-novedades-inv' : 'pie-novedades'}
              placeholder="nombre@dominio.com"
              rotuloDeEnvio="Suscribirme"
              icono={<ArrowRight className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
            />
          </div>
        </BloqueDeColumnasDelPie>
        <TituloDeCierreDelPie como="h3">Construimos lo que te falta</TituloDeCierreDelPie>
      </Pie>
    </div>
  )
}
