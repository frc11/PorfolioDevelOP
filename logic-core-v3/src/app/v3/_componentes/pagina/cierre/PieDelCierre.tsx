'use client'

import { POSES_DEL_FINAL, huecoDelLogo } from '../../../_lib/escena/finalDelRecorrido'
import { PARTES_DEL_CIERRE } from '../../../_lib/escena/ruta/atributoDelCierre'
import { ModoDelPieForzado } from '../../../_lib/pie3d/registro'
import { Bloque, CoreografiaEnTodoAncho, type Progreso } from '../../../_secciones/_contrato/coreografia'
import { LLEGADAS_DEL_PIE } from '../../../_secciones/cierre/Cierre'
import { CajaDeVidrio } from '../../../_secciones/cierre/ColumnasDelPie'
import { COLUMNAS, DESTINOS_DE_LA_RUTA, TITULAR_DE_CIERRE } from '../../../_secciones/cierre/contenido'
import { FormularioDelPie } from '../../../_secciones/cierre/FormularioDelPie'
import { ContactoDelPie, LineaLegal, RedesDelPie } from '../../../_secciones/cierre/PiezasDeContacto'
import { Pie } from '../../chrome/Pie'
import { Logotipo } from '../../marca/Marca'
import { EnlaceDeRuta } from '../../navegacion/EnlaceDeRuta'
import { EtiquetaDeSeccion } from '../../tipografia/Textos'
import { Titular } from '../../tipografia/Titular'

import { LlegaEnElPie } from './LlegaDelCierre'

/**
 * [B13] EL PIE DEL CIERRE DE UNA PÁGINA — el del home (su titular, el mail y WhatsApp, el formulario de contacto, las redes y la línea
 * legal), plano en todo ancho (`ModoDelPieForzado`): el de volumen se arma alrededor del logo que cae en su hueco, que es el final del home;
 * el de una página es la resolución. Llega con las ventanas del pie del home (`LLEGADAS_DEL_PIE`) mientras su pantalla entra, DESPUÉS de la
 * resolución (el piso ya liso), con el logo en el centro (la pose E): las columnas a sus costados, como el pie plano del home. El recorrido
 * lleva a las secciones del home con `EnlaceDeRuta` (`/v3#…`, con el velo): sus anclas no existen en la página.
 */
const ID_DEL_TITULAR = 'titular-del-pie-del-cierre'
const ROTULO = { recorrido: COLUMNAS.find((c) => c.clase === 'recorrido')?.titulo ?? '', contacto: COLUMNAS.find((c) => c.clase === 'contacto')?.titulo ?? '' }
const HUECO = { ['--hueco-del-pie' as string]: `${huecoDelLogo(POSES_DEL_FINAL.pie.distance).toFixed(1)}svh` } as React.CSSProperties
// [B10] Cada columna lleva `data-columna-del-pie`: con el FAQ, se hunde en su lugar (`_componentes/faq/`) y de ahí nacen sus bloques.
const COLUMNA = 'escritorio:absolute escritorio:top-1/2 escritorio:-translate-y-1/2 escritorio:w-[calc(50%-var(--hueco-del-pie))]'

export function PieDelCierre(): React.JSX.Element {
  return (
    <ModoDelPieForzado.Provider value="plano">
      <section data-parte={PARTES_DEL_CIERRE.pie} aria-labelledby={ID_DEL_TITULAR} className="grid min-h-svh" style={HUECO}>
        <CoreografiaEnTodoAncho>
          <Bloque patron="P2" className="grid">
            {(progreso: Progreso) => <ContenidoDelPie progreso={progreso} />}
          </Bloque>
        </CoreografiaEnTodoAncho>
      </section>
    </ModoDelPieForzado.Provider>
  )
}

function ContenidoDelPie({ progreso }: { readonly progreso: Progreso }): React.JSX.Element {
  return (
    <Pie className="grid" claseDeEnvoltorio="grid" claseDeContenido="relative grid content-between gap-[var(--spacing-4)] max-tablet:gap-[var(--spacing-2)] tablet:grid-cols-2 tablet:gap-[var(--spacing-12)] escritorio:block">
      <div data-columna-del-pie="" className={`${COLUMNA} escritorio:left-0`}>
        <LlegaEnElPie progreso={progreso} ventana={LLEGADAS_DEL_PIE.izquierda} className="flex flex-col gap-[var(--spacing-3)] tablet:gap-[var(--spacing-6)]">
          <div className="max-escritorio:hidden">
            <Logotipo />
          </div>
          <Titular nivel="titulo-xl" como="h2" peso="normal" id={ID_DEL_TITULAR} className="text-balance max-tablet:text-fluido-titulo-l">
            {TITULAR_DE_CIERRE}
          </Titular>
          <ContactoDelPie />
        </LlegaEnElPie>
      </div>
      <div data-columna-del-pie="" className={`${COLUMNA} escritorio:right-0`}>
        <LlegaEnElPie progreso={progreso} ventana={LLEGADAS_DEL_PIE.derecha} className="grid grid-cols-1 gap-[var(--spacing-8)] movil:grid-cols-2 tablet:grid-cols-1 escritorio:grid-cols-2">
          <nav aria-label={ROTULO.recorrido} className="flex flex-col gap-[var(--spacing-2)] tablet:gap-[var(--spacing-4)]">
            <EtiquetaDeSeccion como="h3" sangria={false}>
              {ROTULO.recorrido}
            </EtiquetaDeSeccion>
            <ul data-pieza="destinos-del-cierre" className="grid grid-cols-2 gap-x-[var(--spacing-6)] gap-y-[var(--spacing-1)] tablet:grid-cols-1 tablet:gap-y-[var(--spacing-2)]">
              {DESTINOS_DE_LA_RUTA.map((destino) => (
                <li key={destino.ancla}>
                  <EnlaceDeRuta href={`/v3${destino.ancla}`} className="text-cuerpo font-semi underline-offset-4 hover:underline focus-visible:underline">
                    {destino.rotulo}
                  </EnlaceDeRuta>
                </li>
              ))}
            </ul>
          </nav>
          <CajaDeVidrio>
            <EtiquetaDeSeccion como="h3" sangria={false}>
              {ROTULO.contacto}
            </EtiquetaDeSeccion>
            <FormularioDelPie />
          </CajaDeVidrio>
        </LlegaEnElPie>
      </div>
      <div data-columna-del-pie="" className="tablet:col-span-2 escritorio:absolute escritorio:inset-x-0 escritorio:bottom-0">
        <LlegaEnElPie progreso={progreso} ventana={LLEGADAS_DEL_PIE.abajo} className="flex flex-col gap-[var(--spacing-2)] tablet:gap-[var(--spacing-6)] escritorio:flex-row escritorio:items-center escritorio:justify-between">
          <RedesDelPie />
          <LineaLegal alineado="fin" />
        </LlegaEnElPie>
      </div>
    </Pie>
  )
}
