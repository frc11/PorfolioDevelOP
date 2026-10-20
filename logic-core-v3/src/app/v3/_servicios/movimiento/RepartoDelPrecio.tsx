'use client'

import { motion, useTransform, type MotionStyle, type MotionValue } from 'motion/react'
import type { ReactNode } from 'react'

import { Bloque, CoreografiaEnTodoAncho } from '../../_secciones/_contrato/coreografia'
import type { EstiloConVariables } from '../estiloDelAcento'
import { entradaDelPanel } from './coreografiaDelPrecio'

/**
 * [SERVICIOS M2a] EL REPARTO DEL PRECIO — la sección alta y su caja anclada, con el progreso del home (M0 §3.2).
 *
 *   · La sección mide tres pantallas solo con la preferencia sin reducir (`motion-safe`, por CSS: el HTML servido ya tiene el alto que
 *     va a tener); con movimiento reducido mide una, y la caja anclada no se mueve.
 *   · El progreso es el `Bloque` del contrato con P2 y `del-patron` sobre la sección alta, en todo ancho (`CoreografiaEnTodoAncho`,
 *     como Trabajos del home): vale 0 cuando el tope asoma por abajo y 1 cuando el anclaje suelta. El `div` que se mide nunca se
 *     transforma; lo que se mueve son los paneles, adentro de la caja anclada.
 *   · De ese progreso sale la entrada de cada panel (`coreografiaDelPrecio.ts`: la Mediana primero), que llega a los paneles como
 *     `--entrada-0`, `--entrada-1` y `--entrada-2`. Sin progreso (la rama quieta: el HTML servido, el movimiento reducido, el chunk en
 *     camino) las variables no existen y los paneles se leen con su valor de reserva, 1: todo a la vista y quieto.
 *   · La caja anclada es un contenedor de tamaño: los recortes y las cajas del texto se escriben en `cqw` y `cqh`.
 */
const CLASE_DE_LA_CAJA_ANCLADA = 'sticky top-0 h-svh w-full overflow-hidden'
const ESTILO_DE_LA_CAJA_ANCLADA: React.CSSProperties = { containerType: 'size' }
const ESTILO_DE_LA_SECCION_ALTA: EstiloConVariables = { '--alto-del-precio': '300svh' }

/** Un `style` de motion que también lleva variables CSS animadas: motion las escribe como custom properties. */
type EstiloConEntradas = MotionStyle & { readonly [variable: `--${string}`]: MotionValue<number> }

function CajaQueReparte({ progreso, children }: { readonly progreso: MotionValue<number>; readonly children: ReactNode }): React.JSX.Element {
  const simple = useTransform(progreso, (p) => entradaDelPanel(0, p))
  const mediana = useTransform(progreso, (p) => entradaDelPanel(1, p))
  const premium = useTransform(progreso, (p) => entradaDelPanel(2, p))
  const estilo: EstiloConEntradas = { ...ESTILO_DE_LA_CAJA_ANCLADA, '--entrada-0': simple, '--entrada-1': mediana, '--entrada-2': premium }
  return (
    <motion.div className={CLASE_DE_LA_CAJA_ANCLADA} style={estilo}>
      {children}
    </motion.div>
  )
}

export function RepartoDelPrecio({ children }: { readonly children: ReactNode }): React.JSX.Element {
  return (
    <CoreografiaEnTodoAncho>
      <Bloque patron="P2" rango="del-patron" className="relative h-svh motion-safe:h-[var(--alto-del-precio)]" style={ESTILO_DE_LA_SECCION_ALTA}>
        {(progreso) =>
          progreso === null ? (
            <div className={CLASE_DE_LA_CAJA_ANCLADA} style={ESTILO_DE_LA_CAJA_ANCLADA}>
              {children}
            </div>
          ) : (
            <CajaQueReparte progreso={progreso}>{children}</CajaQueReparte>
          )
        }
      </Bloque>
    </CoreografiaEnTodoAncho>
  )
}
