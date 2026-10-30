'use client'

import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'

import { porCuadroDelScroll } from '../_componentes/pagina/alCruzar'
import { SeccionDePapel } from '../_componentes/pagina/SeccionDePapel'
import { usePrefiereMenosMovimiento } from '../_lib/usePrefiereMenosMovimiento'
import { Trazo } from '../_secciones/_contrato/canales'
import { Bloque, CoreografiaEnTodoAncho, type Progreso } from '../_secciones/_contrato/coreografia'
import { TituloQueSube } from '../_secciones/_contrato/TituloQueSube'

import { PROCESO } from './contenido'

/** Dónde se dibuja la línea: la fracción del alto de la pantalla a la que llega su punta (la línea de lectura). */
export const LINEA_DE_LECTURA = 0.6

/** Cuánto de la línea está dibujado (0…1) con su tope en `tope` (px desde arriba de la pantalla), su `largo` y una pantalla de `alto`. */
export function avanceDeLaLinea(tope: number, largo: number, alto: number): number {
  if (!(largo > 0) || !(alto > 0)) return 1
  const v = (alto * LINEA_DE_LECTURA - tope) / largo
  return v <= 0 ? 0 : v >= 1 ? 1 : v
}

/**
 * [M1] CÓMO TRABAJAMOS — el prototipo 7 (`como-trabajamos`, «INCREÍBLE efecto»): el proceso en una columna, con una línea vertical que se
 * dibuja con el scroll y une los pasos; cada paso, cuando la línea lo alcanza, se SUBRAYA con el trazo del titular de Quiénes somos y pasa
 * de tenue a tinta. Atado al scroll en todo ancho; al subir, se desdibuja. Con movimiento reducido, todo dibujado.
 */
export function ComoTrabajamos(): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const fondo = useRef<HTMLSpanElement>(null)
  const linea = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const f = fondo.current
    const l = linea.current
    if (f === null || l === null) return undefined
    if (reducido) {
      l.style.transform = 'scaleY(1)'
      return undefined
    }
    // Se mide la línea de fondo (sin transformar), no la columna: la columna lleva aire abajo que la línea no recorre.
    return porCuadroDelScroll(() => {
      const caja = f.getBoundingClientRect()
      l.style.transform = `scaleY(${avanceDeLaLinea(caja.top, caja.height, window.innerHeight).toFixed(4)})`
    })
  }, [reducido])

  return (
    <SeccionDePapel dato="proceso" claseDeContenido="gap-[var(--spacing-16)]">
      <TituloQueSube titulo={PROCESO.titulo} como="h2" nivel="titulo-l" />
      <CoreografiaEnTodoAncho>
        <ol data-pieza="como-trabajamos" className="relative pb-[30svh]">
          {/* La línea: de punta a punta de la columna, del grosor del trazo, dibujada de arriba hacia abajo. */}
          <span ref={fondo} data-linea="fondo" aria-hidden="true" className="absolute top-0 bottom-[30svh] left-0 w-[calc(var(--border-hairline)*3)] bg-borde" />
          <span ref={linea} data-linea="tinta" aria-hidden="true" className="absolute top-0 bottom-[30svh] left-0 w-[calc(var(--border-hairline)*3)] origin-top bg-tinta will-change-transform" style={{ transform: 'scaleY(0)' }} />
          {PROCESO.pasos.map((p, i) => (
            <li key={p.titulo} className="relative pb-[16svh] pl-[var(--spacing-8)] last:pb-0 tablet:pl-[var(--spacing-16)]">
              <Bloque patron="P1" rango="ventana-del-trazo">
                {(progreso) => <Paso progreso={progreso} numero={i + 1} titulo={p.titulo} texto={p.texto} />}
              </Bloque>
            </li>
          ))}
        </ol>
      </CoreografiaEnTodoAncho>
    </SeccionDePapel>
  )
}

function Paso({ progreso, numero, titulo, texto }: { readonly progreso: Progreso; readonly numero: number; readonly titulo: string; readonly texto: string }): React.JSX.Element {
  const quieto = useMotionValue(1)
  const p: MotionValue<number> = progreso ?? quieto
  // El subrayado del home se dibuja en la primera mitad de lo que recibe: acá, en toda la ventana del paso.
  const subrayado = useTransform(p, (v) => Math.min(1, Math.max(0, v)) * 0.5)
  const tinta = useTransform(p, [0.1, 0.5], [0.35, 1])
  return (
    <motion.div style={progreso === null ? undefined : { opacity: tinta }}>
      <p className="font-codigo text-caption text-tinta-media">{String(numero).padStart(2, '0')}</p>
      <h3 className="mt-[var(--spacing-1)] font-display text-titulo-m leading-titulo font-fuerte tracking-display uppercase escritorio:text-titulo-l">
        <Trazo progreso={progreso === null ? null : subrayado} tipo="subrayado">
          {titulo}
        </Trazo>
      </h3>
      <p className="mt-[var(--spacing-4)] max-w-[56ch] text-base leading-texto">{texto}</p>
    </motion.div>
  )
}
