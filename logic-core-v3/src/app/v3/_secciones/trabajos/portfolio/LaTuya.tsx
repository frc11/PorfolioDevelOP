'use client'

import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'

import { CONTENIDO } from '../contenido'

import { TIRA_DE_LA_TUYA } from './estado'
import { FormularioDeLaTuya } from './FormularioDeLaTuya'
import { FormularioEnPerspectiva } from './FormularioEnPerspectiva'
import { enLaSecuencia } from './secuencia'
import { SignoDePregunta } from './SignoDePregunta'
import { CLASES_DE_LA_TIRA, CabeceraDeLaTira, idsDeLaTira } from './Tira'
import type { PortfolioVivo } from './usePortfolio'

/**
 * [B1.2b] El nivel del título de «la tuya»: el más grande de la escala de los titulares en el que su palabra más larga («próxima»,
 * ~3,9 em de Chivo) entra en la tira activa sin cortarse a 1024 (280 px de texto) y a 1440 (488): `titulo-xl` (48 y 56 px).
 * `display-xl` (90 px a 1024) la parte. s76 lo cuenta.
 */
export const NIVEL_DEL_TITULO_DE_LA_TUYA = 'titulo-xl'

/**
 * [B1.2b] El título de «la tuya» es lo primero de su tira, arriba de todo, y la barra flota en esa franja: la tira activa deja libre
 * lo que ocupa la barra en reposo (el mismo despeje que el de las anclas, `scroll-padding-top` en `navegacion.css`; s76 compara las
 * dos expresiones) y la cabecera pone el aire. El banco lo encontró: a 1024 la pastilla tapaba el título (contraste 2,1:1). En
 * línea: no es una clase del lane. [B1.2c] La columna del encabezado deja el mismo despeje.
 */
export const DESPEJE_DE_LA_BARRA = 'calc(var(--spacing-6) + var(--spacing-3) * 2 + var(--text-cuerpo) * var(--leading-texto))'

/**
 * [B1] «LA PRÓXIMA ES LA TUYA» — la última tira (plan §5.5; [B1.2b] §12, punto 4; [B1.2c] §13, punto 6). La marca de agua es el «?» con
 * el estilo del logo, ahora CENTRADO en la tira y armándose cuando la tira se activa (`SignoDePregunta`). El título, grande; la frase
 * y la bajada; y [B1.2c] en lugar del botón, el formulario corto (`FormularioDeLaTuya`: la validación, el envío y los textos del
 * contacto) con el enlace a WhatsApp. Entra con la secuencia de las tiras (`secuencia.ts`).
 */
export function LaTuya({ activa, visible, vivo }: { readonly activa: boolean; readonly visible: boolean; readonly vivo: PortfolioVivo }): React.JSX.Element {
  const ids = idsDeLaTira('la-tuya')
  const c = CONTENIDO.laTuya
  return (
    // [B1.2d B] B6 · el bloque entero (título, frase, bajada, formulario y la fila del botón), centrado en el alto del panel con el mismo
    // despeje arriba y abajo: sin el hueco grande de abajo.
    <div data-tira="la-tuya" data-activa={activa} className={cn(CLASES_DE_LA_TIRA.base, activa ? CLASES_DE_LA_TIRA.activa : CLASES_DE_LA_TIRA.lomo, activa && 'justify-center')} style={activa ? { paddingTop: DESPEJE_DE_LA_BARRA, paddingBottom: DESPEJE_DE_LA_BARRA } : undefined}>
      {activa ? <SignoDePregunta visible={visible} reducido={vivo.reducido} /> : null}
      <CabeceraDeLaTira id={ids.cabecera} indice={TIRA_DE_LA_TUYA} activa={activa} nombre={c.nombre} controla={ids.region} nivel={NIVEL_DEL_TITULO_DE_LA_TUYA} visible={visible} reducido={vivo.reducido} alElegir={() => vivo.saltarAlPaso(TIRA_DE_LA_TUYA, true)} />
      <div id={ids.region} hidden={!activa} className="relative flex min-h-0 flex-col gap-5 px-8 pt-4">
        <motion.div {...enLaSecuencia(visible, 1, vivo.reducido)}>
          <Titular nivel="titulo-m" como="p">{c.frase}</Titular>
        </motion.div>
        <motion.div {...enLaSecuencia(visible, 2, vivo.reducido)}>
          <Cuerpo className="text-tinta/70">{c.bajada}</Cuerpo>
        </motion.div>
        {/* [B1.2d B] B7 · `?form=3d`: el mismo formulario en perspectiva (una prueba; sin la bandera, plano). */}
        <FormularioEnPerspectiva>
          <FormularioDeLaTuya visible={visible} reducido={vivo.reducido} desde={3} />
        </FormularioEnPerspectiva>
      </div>
    </div>
  )
}
