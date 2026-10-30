'use client'

import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'

import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { Trazo } from '../../_secciones/_contrato/canales'
import { Bloque, CoreografiaEnTodoAncho, type Progreso } from '../../_secciones/_contrato/coreografia'
import { CompuertaDelHome } from '../../_secciones/CompuertaDelHome'

/**
 * Los pasos, armados SÓLO con lo que el home ya dice: «Primero nos sentamos a entender cómo trabajás… Después presupuestamos, no antes»
 * (Software), «Hablás con quien lo hace» y «Ves cómo va tu proyecto y pedís cambios sin esperar un mail» (Seis razones), «la manejás vos
 * desde tu panel» (Web) y «Tu panel crece con vos» (el Panel).
 */
const PASOS = [
  { titulo: 'Charlamos', texto: 'Nos sentamos a entender tu negocio: qué vendés, cómo trabajás, quién lo usa y dónde se traba. Hablás con quienes lo van a hacer.' },
  { titulo: 'Presupuestamos', texto: 'Después de entender, no antes. Te decimos qué te conviene y por qué.' },
  { titulo: 'Lo construimos', texto: 'Desde cero, para tu negocio. Ves cómo va en tu panel y pedís cambios sin esperar un mail.' },
  { titulo: 'Lo manejás vos', texto: 'Cuando está listo, no te lo tiramos por la cabeza: cambiás precios, fotos y textos desde tu panel, sin depender de nadie.' },
  { titulo: 'Crece con vos', texto: 'Sumamos módulos nuevos cuando tu negocio los necesita.' },
] as const

/**
 * [L7e · N3] CÓMO TRABAJAMOS, CON UN TRAZO — el proceso en una columna. Una línea vertical (la raya del `Trazo`, de pie) se dibuja con el
 * scroll y une los pasos; cada paso, cuando la línea lo alcanza, se SUBRAYA con el trazo del titular de Quiénes somos y pasa de tenue a
 * tinta. Atado al scroll en todo ancho; al subir, se desdibuja. Con movimiento reducido, todo dibujado.
 */
export function ComoTrabajamos(): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const columna = useRef<HTMLOListElement>(null)
  const linea = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = columna.current
    const l = linea.current
    if (el === null || l === null) return undefined
    if (reducido) {
      l.style.transform = 'scaleY(1)'
      return undefined
    }
    let pedido = 0
    const dibujar = (): void => {
      pedido = 0
      // Se mide la línea de fondo (sin transformar), no la columna: la columna lleva aire abajo que la línea no recorre.
      const caja = (el.querySelector('[data-linea="fondo"]') ?? el).getBoundingClientRect()
      const v = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - caja.top) / caja.height))
      l.style.transform = `scaleY(${v.toFixed(4)})`
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(dibujar)
    }
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    dibujar()
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
    }
  }, [reducido])

  return (
    <CompuertaDelHome>
      <CoreografiaEnTodoAncho>
        <header className="mx-auto max-w-4xl px-6 pt-36 pb-[18svh] escritorio:pt-44">
          <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Nosotros · el proceso</p>
          <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
            <span className="block font-display font-fuerte tracking-display uppercase">Cómo</span>
            <span className="block font-liviano tracking-titulo italic uppercase">trabajamos</span>
          </h1>
        </header>
        <ol ref={columna} className="relative mx-auto max-w-4xl px-6 pb-[40svh]">
          {/* La línea: de punta a punta de la columna, del grosor del trazo, dibujada de arriba hacia abajo. */}
          <span data-linea="fondo" aria-hidden="true" className="absolute top-0 bottom-[40svh] left-6 w-[calc(var(--border-hairline)*3)] bg-borde" />
          <span ref={linea} aria-hidden="true" className="absolute top-0 bottom-[40svh] left-6 w-[calc(var(--border-hairline)*3)] origin-top bg-tinta" style={{ transform: 'scaleY(0)' }} />
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="relative pb-[16svh] pl-10 tablet:pl-16">
              <Bloque patron="P1" rango="ventana-del-trazo">
                {(progreso) => <Paso progreso={progreso} numero={i + 1} titulo={p.titulo} texto={p.texto} />}
              </Bloque>
            </li>
          ))}
        </ol>
      </CoreografiaEnTodoAncho>
    </CompuertaDelHome>
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
      <h2 className="mt-1 font-display text-titulo-m leading-titulo font-fuerte tracking-display uppercase escritorio:text-titulo-l">
        <Trazo progreso={progreso === null ? null : subrayado} tipo="subrayado">
          {titulo}
        </Trazo>
      </h2>
      <p className="mt-4 max-w-xl text-base leading-texto">{texto}</p>
    </motion.div>
  )
}
