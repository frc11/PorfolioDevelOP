'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'

import { TituloDeVolumen } from '../../../_componentes/titulos3d/TituloDeVolumen'
import { Titular } from '../../../_componentes/tipografia/Titular'
import { LECTURA } from '../../../_lib/titulos3d/registro'
import { SUBIDA_DE_LA_FRASE_SVH } from '../geometria'
import { CapaDelAro } from './CapaDelAro'
import { TITULO_DE_LAS_RESENAS } from './contenido'
import { ALTO_DEL_ESPACIADOR_SVH, TITULOS_DE_LAS_RESENAS, pinSinLasResenas } from './tramo'
import { useBanderasDeLasResenas, useTramoDeLasResenas } from './useTramoDeLasResenas'

/**
 * [NOCTURNO B2] LAS RESEÑAS EN EL ESCENARIO DE «POR QUÉ develOP» (desde 1024, con movimiento) — adentro de la caja clavada: el título en
 * que se da vuelta la frase y las tarjetas del aro (la escena dibuja las placas). Para el lector y el teclado, `ResenasParaElLector` (antes del CTA). El tramo (el avance, el
 * giro, la ida de los valores, la entrada del aro y la REGLA DE ALTURAS) es de `useTramoDeLasResenas`; `pin` es el del bloque, con el tramo.
 */
export function EscenarioDeLasResenas({ pin }: { readonly pin: MotionValue<number> }): React.JSX.Element {
  const raiz = useRef<HTMLDivElement>(null)
  const { variante } = useBanderasDeLasResenas()
  const giro = useTramoDeLasResenas(pin, raiz, variante)
  return (
    <div ref={raiz} data-pieza="resenas-del-final" data-resenas={variante} className="contents">
      <TituloDeLasResenas giro={giro} />
      <CapaDelAro />
    </div>
  )
}

/** El pin de siempre para lo que ya existía en el escenario (la frase, los valores, la levantada, el CTA). */
export function usePinSinLasResenas(pin: MotionValue<number>): MotionValue<number> {
  return useTransform(pin, pinSinLasResenas)
}

/** Lo que el escenario suma después de su caja clavada: el pin crece lo del tramo (la tabla de secciones no se toca). */
export function EspaciadorDeLasResenas(): React.JSX.Element {
  return <div aria-hidden="true" data-pieza="espaciador-de-las-resenas" style={{ height: `${String(ALTO_DEL_ESPACIADOR_SVH)}svh` }} />
}

const SUBIDA = `${String(-SUBIDA_DE_LA_FRASE_SVH)}svh`

/**
 * El título de las reseñas, en el MISMO lugar que la frase (cada mitad a su lado del logo, ya subida): sus mitades son títulos de volumen
 * con la misma letra y la misma lectura; la escena las da vuelta (`titulos3d/giro.ts`). En el DOM (sin WebGL) aparece en la segunda mitad
 * del giro. Para el lector, el título está en `ResenasParaElLector`.
 */
function TituloDeLasResenas({ giro }: { readonly giro: MotionValue<number> }): React.JSX.Element {
  const opacity = useTransform(giro, (g) => Math.min(1, Math.max(0, g * 2 - 1)))
  return (
    <motion.div aria-hidden="true" data-pieza="titulo-de-las-resenas" className="pointer-events-none absolute inset-0" style={{ y: SUBIDA, opacity }}>
      <span className="absolute top-1/2 right-[calc(50%+var(--hueco-de-la-frase))] -translate-y-1/2">
        <MitadDelTitulo id={TITULOS_DE_LAS_RESENAS[0]} texto={TITULO_DE_LAS_RESENAS.izquierda} />
      </span>{' '}
      <span className="absolute top-1/2 left-[calc(50%+var(--hueco-de-la-frase))] -translate-y-1/2">
        <MitadDelTitulo id={TITULOS_DE_LAS_RESENAS[1]} texto={TITULO_DE_LAS_RESENAS.derecha} />
      </span>
    </motion.div>
  )
}

/** Una mitad: el cuerpo de la frase, con el divisor de su mitad más larga («nuestros clientes», 8,3 em): entra al costado del logo. */
function MitadDelTitulo({ id, texto }: { readonly id: string; readonly texto: string }): React.JSX.Element {
  return (
    <Titular nivel="titulo-xl" como="span" className="block whitespace-nowrap escritorio:text-[length:min(var(--text-fluido-titulo-xl),calc((50vw-var(--hueco-de-la-frase)-var(--spacing-8))/8.5))]">
      <TituloDeVolumen id={id} texto={texto} lectura={LECTURA.frase} subida={SUBIDA_DE_LA_FRASE_SVH / 100} llegada={null} salida={null} llegadaDe="por-que-develop" />
    </Titular>
  )
}
