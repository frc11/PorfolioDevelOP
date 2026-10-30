'use client'

import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'

import { Trazo } from '../../_secciones/_contrato/canales'
import { Bloque, CoreografiaEnTodoAncho, type Progreso } from '../../_secciones/_contrato/coreografia'
import { CompuertaDelHome } from '../../_secciones/CompuertaDelHome'
import { TEXTO_DEL_MEDIO, TITULO_DEL_SERVICIO } from '../../_secciones/servicios/escenario/datos'

/** Lo de siempre y lo que lo reemplaza: sólo lo que la página de Software ya promete (sistemas de gestión, turnos, stock, presupuestos, paneles). */
const RENGLONES = [
  { antes: 'La planilla de stock', despues: 'Un sistema de stock' },
  { antes: 'El cuaderno de turnos', despues: 'Una agenda de turnos' },
  { antes: 'El presupuesto en Word', despues: 'Presupuestos desde el sistema' },
  { antes: 'Los mensajes sueltos', despues: 'Un panel con todo junto' },
] as const

const [INTRO, ENTENDEMOS, ARMAMOS] = TEXTO_DEL_MEDIO.software

/**
 * [L7e · S1] LO DE SIEMPRE, TACHADO — la página de Software vende dejar las planillas, y el home ya tiene el gesto: el titular de
 * Quiénes somos («algo distinto, no ~~lo mismo de siempre~~»). Cada renglón de cómo se trabaja hoy se TACHA con el trazo del home (y se
 * despinta), y recién después se escribe lo que lo reemplaza, SUBRAYADO: el tachado niega, el subrayado afirma. Atado al scroll y en
 * todo ancho (`CoreografiaEnTodoAncho`); al subir, se destacha. Con movimiento reducido, todo dibujado.
 */
export function LoDeSiempreTachado(): React.JSX.Element {
  const titulo = TITULO_DEL_SERVICIO.software
  return (
    <CompuertaDelHome>
      <CoreografiaEnTodoAncho>
        <div data-servicio="software">
          <header className="mx-auto max-w-5xl px-6 pt-36 pb-10 escritorio:pt-44">
            <p className="font-codigo text-caption tracking-wide text-acento uppercase">Software a medida · por qué</p>
            <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
              <span className="block font-display font-fuerte tracking-display uppercase">{titulo.derecho}</span>
              <span className="block font-liviano tracking-titulo italic uppercase">{titulo.cursiva}</span>
            </h1>
            <p className="mt-8 max-w-2xl text-cuerpo leading-texto escritorio:text-base">{INTRO}</p>
          </header>
          <ol className="mx-auto max-w-5xl px-6 pt-[20svh] pb-[10svh]">
            {RENGLONES.map((r) => (
              <li key={r.antes} className="py-[9svh]">
                <Bloque patron="P1" rango="ventana-del-trazo">
                  {(progreso) => <Renglon progreso={progreso} antes={r.antes} despues={r.despues} />}
                </Bloque>
              </li>
            ))}
          </ol>
          <section className="mx-auto max-w-5xl space-y-5 px-6 pt-10 pb-48">
            <p className="max-w-2xl text-cuerpo leading-texto escritorio:text-base">{ENTENDEMOS}</p>
            <p className="max-w-2xl text-cuerpo leading-texto escritorio:text-base">{ARMAMOS}</p>
          </section>
        </div>
      </CoreografiaEnTodoAncho>
    </CompuertaDelHome>
  )
}

/**
 * Un renglón: el tachado corre en la primera mitad de su ventana y lo nuevo en la segunda (el `Trazo` del home dibuja el tachado en la
 * segunda mitad de lo que recibe y el subrayado en la primera, así que a cada uno se le pasa su tramo ya corrido).
 */
function Renglon({ progreso, antes, despues }: { readonly progreso: Progreso; readonly antes: string; readonly despues: string }): React.JSX.Element {
  const quieto = useMotionValue(1)
  const p: MotionValue<number> = progreso ?? quieto
  // Tachado: la ventana 0 → 0,5 del renglón entra como 0,5 → 1 (la mitad en la que el home tacha).
  const paraTachar = useTransform(p, (v) => 0.5 + Math.min(1, Math.max(0, v / 0.5)) * 0.5)
  // Lo nuevo: aparece de 0,5 a 0,7 y se subraya de 0,55 a 0,95 (entra como 0 → 0,5, la mitad del subrayado).
  const paraSubrayar = useTransform(p, (v) => Math.min(1, Math.max(0, (v - 0.55) / 0.4)) * 0.5)
  const presencia = useTransform(p, [0.5, 0.7], [0, 1])
  const subida = useTransform(p, [0.5, 0.7], ['40%', '0%'])
  const conMovimiento = progreso !== null
  return (
    <div className="flex flex-col gap-3 escritorio:flex-row escritorio:items-baseline escritorio:justify-between escritorio:gap-10">
      <p className="text-titulo-s leading-titulo tablet:text-titulo-m escritorio:text-titulo-l">
        <Trazo progreso={conMovimiento ? paraTachar : null} tipo="tachado">
          {antes}
        </Trazo>
      </p>
      <span className="block overflow-hidden escritorio:text-right">
        <motion.span className="block font-display text-titulo-s leading-titulo tablet:text-titulo-m font-fuerte tracking-display text-acento uppercase" style={conMovimiento ? { opacity: presencia, y: subida } : undefined}>
          <Trazo progreso={conMovimiento ? paraSubrayar : null} tipo="subrayado">
            {despues}
          </Trazo>
        </motion.span>
      </span>
    </div>
  )
}
