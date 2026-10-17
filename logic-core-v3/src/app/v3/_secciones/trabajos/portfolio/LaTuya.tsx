'use client'

import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'

import { CONTENIDO } from '../contenido'

import { TIRA_DE_LA_TUYA, vistaDelPaso } from './estado'
import { SignoDePregunta } from './MarcaDeAgua'
import { enLaSecuencia } from './secuencia'
import { CLASES_DE_LA_TIRA, CabeceraDeLaTira, idsDeLaTira } from './Tira'
import type { PortfolioVivo } from './usePortfolio'

/**
 * [B1.2b] El nivel del título de «la tuya»: el más grande de la escala de los titulares en el que su palabra más larga («próxima»,
 * ~3,9 em de Chivo) entra en la tira activa sin cortarse a 1024 (280 px de texto) y a 1440 (488): `titulo-xl` (48 y 56 px).
 * `display-xl` (90 px a 1024) la parte. s76 lo cuenta.
 */
export const NIVEL_DEL_TITULO_DE_LA_TUYA = 'titulo-xl'

/**
 * [B1] «LA PRÓXIMA ES LA TUYA» — la última tira (plan §5.5; [B1.2b] §12, punto 4). El «?» 3D se borró: la marca de agua es un «?» 2D
 * quieto con el estilo del logo, pegado al borde izquierdo (`SignoDePregunta`, el mismo tratamiento que las de los clientes). El
 * título, grande; la frase y la bajada; y el CTA como un botón grande que abre la hoja de contacto de siempre
 * (`data-abre-contacto="panel"`, `_chrome/contacto/apertura.ts`): no hay un modal nuevo ni un efecto nuevo. Entra con la secuencia
 * de las tiras (`secuencia.ts`).
 */
export function LaTuya({ activa, vivo }: { readonly activa: boolean; readonly vivo: PortfolioVivo }): React.JSX.Element {
  const ids = idsDeLaTira('la-tuya')
  const c = CONTENIDO.laTuya
  const visible = activa && vistaDelPaso(vivo.paso).fase === 'adentro'
  return (
    <div data-tira="la-tuya" data-activa={activa} className={cn(CLASES_DE_LA_TIRA.base, activa ? cn(CLASES_DE_LA_TIRA.activa, 'pt-6') : CLASES_DE_LA_TIRA.lomo)}>
      {activa ? <SignoDePregunta /> : null}
      <CabeceraDeLaTira id={ids.cabecera} indice={TIRA_DE_LA_TUYA} activa={activa} nombre={c.nombre} controla={ids.region} nivel={NIVEL_DEL_TITULO_DE_LA_TUYA} visible={visible} reducido={vivo.reducido} alElegir={() => vivo.saltarAlPaso(TIRA_DE_LA_TUYA)} />
      <div id={ids.region} hidden={!activa} className="relative flex min-h-0 flex-1 flex-col gap-6 px-8 pb-12 pt-4">
        <motion.div {...enLaSecuencia(visible, 1, vivo.reducido)}>
          <Titular nivel="titulo-m" como="p">{c.frase}</Titular>
        </motion.div>
        <motion.div {...enLaSecuencia(visible, 2, vivo.reducido)}>
          <Cuerpo className="text-tinta/70">{c.bajada}</Cuerpo>
        </motion.div>
        <motion.button
          type="button"
          data-abre-contacto="panel"
          className="mt-auto self-start rounded-sutil bg-tinta px-8 py-5 font-titulo text-[length:var(--text-titulo-s)] text-fondo transition-colors hover:bg-tinta/85 focus-visible:outline-2 focus-visible:outline-offset-4"
          {...enLaSecuencia(visible, 3, vivo.reducido)}
        >
          {c.boton}
        </motion.button>
      </div>
    </div>
  )
}
