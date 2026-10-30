'use client'

import { DemoEnSuLugar } from '../../_panel-vivo/DemoDelPanel'
import type { IdDeDemo } from '../../_panel-vivo/catalogo'
import { Gatillo } from '../../_secciones/_contrato/Gatillo'
import { CompuertaDelHome } from '../../_secciones/CompuertaDelHome'
import { TEXTO_DEL_MEDIO } from '../../_secciones/servicios/escenario/datos'
import { PANTALLA_DEL_MODULO } from '../../_secciones/tu-panel/geometria'

const [ATIENDE, ENTRENADO, AUTOMATIZA, ABONO] = TEXTO_DEL_MEDIO['ia-automatizacion']

/**
 * [L7e · I1] LA CONVERSACIÓN QUE PASA SOLA — la página de Integraciones con IA muestra el producto trabajando: la demo del chatbot del
 * Panel (`conversaciones`, construida y sin usar en el home) contesta sola al lado del párrafo que la promete, y debajo la demo de lo que
 * el chatbot sabe de tu negocio (`informacion`). Las dos con el mismo escenario del Panel: corre sólo la más visible. El texto es el del
 * home, tal cual (`TEXTO_DEL_MEDIO`), y entra con el gatillo. En papel, con el acento de IA en los oscuros.
 */
export function ConversacionEnVivo(): React.JSX.Element {
  return (
    <CompuertaDelHome>
      <div data-servicio="ia-automatizacion">
        <header className="mx-auto max-w-6xl px-6 pt-36 pb-12 escritorio:pt-44">
          <p className="font-codigo text-caption tracking-wide text-acento uppercase">Integraciones con IA · el chatbot</p>
          <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
            <span className="block font-display font-fuerte tracking-display uppercase">Un chatbot</span>
            <span className="block font-liviano tracking-titulo italic uppercase">que atiende por vos</span>
          </h1>
        </header>
        <Fila demo="conversaciones" lado="derecha" titulo="Contesta mientras vos trabajás" parrafos={[ATIENDE]} />
        <Fila demo="informacion" lado="izquierda" titulo="Sabe lo que vos sabés" parrafos={[ENTRENADO, ABONO]} />
        <section className="mx-auto max-w-3xl px-6 pt-8 pb-40">
          <Gatillo desde="abajo">
            <p className="text-titulo-s leading-titulo">{AUTOMATIZA}</p>
          </Gatillo>
        </section>
      </div>
    </CompuertaDelHome>
  )
}

function Fila({ demo, lado, titulo, parrafos }: { readonly demo: IdDeDemo; readonly lado: 'izquierda' | 'derecha'; readonly titulo: string; readonly parrafos: readonly string[] }): React.JSX.Element {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 escritorio:grid-cols-[1fr_1.5fr] escritorio:gap-16 escritorio:py-24">
      <div className={lado === 'izquierda' ? 'escritorio:order-2' : undefined}>
        <Gatillo desde="abajo">
          <h2 className="font-display text-titulo-m font-fuerte leading-titulo tracking-display text-acento uppercase">{titulo}</h2>
          <div className="mt-5 space-y-4">
            {parrafos.map((p) => (
              <p key={p.slice(0, 24)} className="text-cuerpo leading-texto escritorio:text-base">
                {p}
              </p>
            ))}
          </div>
        </Gatillo>
      </div>
      <div className="relative w-full overflow-hidden rounded-fuerte shadow-2xl shadow-tinta/25" style={{ aspectRatio: `${String(PANTALLA_DEL_MODULO.ancho)} / ${String(PANTALLA_DEL_MODULO.alto)}` }}>
        <DemoEnSuLugar demo={demo} pantalla={PANTALLA_DEL_MODULO} respaldo={<div className="size-full bg-superficie-2" />} />
      </div>
    </section>
  )
}
