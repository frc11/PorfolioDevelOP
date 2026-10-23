'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { ROTULO_ENVIANDO } from '../../_chrome/contacto/contenido'
import {
  ENVIO,
  MENSAJES_DEL_ENVIO,
  esperaParaPasar,
  fundidoDelEnvio,
  vistaDelEstado,
  type EstadoDelEnvio,
  type MensajeDelEnvio,
  type MensajesDelEnvio,
  type ResultadoDelEnvio,
  type VistaDelEnvio,
} from '../../_lib/formularios/estadoDeEnvio'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { Carga } from '../carga/Carga'
import { EncajeDelLogo, PROPORCION_DEL_ENCAJE } from './EncajeDelLogo'

/**
 * [C2 · 20] EL ESTADO DE ENVÍO — el estándar de envío de los formularios de /v3 (ítem 9 de la revisión). El del pie NO lo usa.
 *
 *   <EstadoDeEnvio estado={estado} alVolver={(despuesDe) => { if (despuesDe === 'exito') vaciar(); setEstado('reposo') }}>
 *     <form …>…</form>
 *   </EstadoDeEnvio>
 *
 * Envuelve al formulario y lo muestra según el estado que le da quien lo monta (`reposo | enviando | exito | error`, la parte pura y los
 * tiempos en `_lib/formularios/estadoDeEnvio.ts`):
 *   · enviando: el formulario entero se desvanece y en su lugar, centrada, aparece la carga de develOP (`Carga`, el logo girando; la misma
 *     del login y del contacto), ya girando, con un fundido. Se ve por lo menos `ENVIO.minimoDeLaCargaMs` aunque la respuesta llegue antes.
 *   · exito | error: la carga se desvanece y aparece el encastre del logo (`EncajeDelLogo`, el de la tarjeta del resultado del contacto y
 *     del pie: la pieza que encaja, o que choca con el borde en rojo y queda afuera) con su sonido, y debajo el mensaje.
 *   · a los `ENVIO.mensajeMs` de que el encastre aterrizó avisa `alVolver` (con cuál fue: `exito` o `error`): quien lo monta vuelve a
 *     `reposo` y el formulario regresa con un fundido. Después del éxito, vacío (lo vacía quien lo monta en ese aviso: el formulario todavía
 *     no se ve); después del error, con lo escrito.
 *
 * El formulario nunca se desmonta (lo escrito se queda): mientras no se ve está `inert` y transparente, y la capa del estado va encima, en
 * la misma celda (el alto es el del formulario; si el mensaje es más alto, la caja crece). Los colores salen del contexto: la carga va en
 * la tinta y el encastre toma el fondo y la tinta de la sección (`piezas.css`), así anda igual sobre el papel y en una sección invertida.
 * Con movimiento reducido: fundidos cortos, la carga quieta y el encastre en su estado final. El foco: si estaba en el formulario, pasa a
 * la capa del estado, y al volver, a la caja del formulario (el próximo Tab cae en su primer campo). El mensaje se anuncia (status o alert).
 */
interface Props {
  readonly estado: EstadoDelEnvio
  /** El mensaje terminó: quien lo monta vuelve a `reposo` y, si fue después del éxito, vacía el formulario (todavía no se ve). */
  readonly alVolver: (despuesDe: ResultadoDelEnvio) => void
  /** Los textos del éxito y del error. Por defecto, los de contacto (`MENSAJES_DEL_ENVIO.contacto`). */
  readonly mensajes?: MensajesDelEnvio
  /** El nombre accesible de la carga (por defecto, «Enviando…» del contacto). */
  readonly etiquetaDeCarga?: string
  /** Líneas que se suceden debajo de la carga mientras espera (opcional: las de `Carga`). */
  readonly textosDeCarga?: readonly string[]
  /** Para los formularios chicos (la newsletter): la carga y el encastre más chicos, el título en el cuerpo. */
  readonly compacto?: boolean
  readonly className?: string
  readonly children: React.ReactNode
}

const CURVA = [0.25, 0.46, 0.45, 0.94] as const

export function EstadoDeEnvio({ estado, alVolver, mensajes = MENSAJES_DEL_ENVIO.contacto, etiquetaDeCarga = ROTULO_ENVIANDO, textosDeCarga, compacto = false, className, children }: Props): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const fundido = fundidoDelEnvio(reducido)
  const [vista, setVista] = useState<VistaDelEnvio>(() => vistaDelEstado(estado))
  const cargaDesde = useRef(0)
  const capaDelFormulario = useRef<HTMLDivElement>(null)
  const capaDelEstado = useRef<HTMLDivElement>(null)
  // El foco estaba en el componente cuando cambió la vista: se muda a la capa que queda a la vista.
  const llevarElFoco = useRef(false)
  const volver = useRef(alVolver)
  useEffect(() => {
    volver.current = alVolver
  })

  // El estado manda; la vista lo sigue, con el mínimo de la carga (siempre desde un temporizador: nunca en el cuerpo del efecto).
  useEffect(() => {
    const siguiente = vistaDelEstado(estado)
    if (siguiente === vista) return undefined
    const pasar = (): void => {
      const activo = document.activeElement
      llevarElFoco.current = activo !== null && ((capaDelFormulario.current?.contains(activo) ?? false) || (capaDelEstado.current?.contains(activo) ?? false))
      if (siguiente === 'carga') cargaDesde.current = performance.now()
      setVista(siguiente)
    }
    const espera = window.setTimeout(pasar, esperaParaPasar(vista, siguiente, cargaDesde.current, performance.now()))
    return () => window.clearTimeout(espera)
  }, [estado, vista])

  useEffect(() => {
    if (!llevarElFoco.current) return
    llevarElFoco.current = false
    const destino = vista === 'formulario' ? capaDelFormulario.current : capaDelEstado.current
    destino?.focus({ preventScroll: true })
  }, [vista])

  const conFormulario = vista === 'formulario'
  const resultado = vista === 'exito' || vista === 'error' ? vista : null
  return (
    <div data-pieza="estado-de-envio" data-vista={vista} className={cn('grid', className)}>
      <motion.div
        ref={capaDelFormulario}
        data-parte="formulario"
        tabIndex={-1}
        inert={!conFormulario}
        className="col-start-1 row-start-1 outline-none"
        initial={false}
        animate={{ opacity: conFormulario ? 1 : 0 }}
        // Al volver, espera a que la capa del estado termine de irse (AnimatePresence en modo `wait`).
        transition={{ duration: fundido, delay: conFormulario ? fundido : 0, ease: CURVA }}
      >
        {children}
      </motion.div>
      <div ref={capaDelEstado} data-parte="estado" tabIndex={-1} className="pointer-events-none col-start-1 row-start-1 flex items-center justify-center outline-none">
        <AnimatePresence mode="wait" initial={false}>
          {vista === 'carga' && (
            <motion.div
              key="carga"
              data-parte="carga-del-envio"
              initial={{ opacity: 0 }}
              // Entra cuando el formulario ya va por la mitad de su fundido: el formulario «se transforma» en la carga.
              animate={{ opacity: 1, transition: { duration: fundido, delay: fundido / 2, ease: CURVA } }}
              exit={{ opacity: 0, transition: { duration: fundido, ease: CURVA } }}
            >
              <Carga tamano={compacto ? 'medio' : 'grande'} etiqueta={etiquetaDeCarga} textos={textosDeCarga} />
            </motion.div>
          )}
          {resultado !== null && (
            <EncajeConMensaje key={resultado} tipo={resultado} mensaje={mensajes[resultado]} compacto={compacto} reducido={reducido} fundido={fundido} alVolver={() => volver.current(resultado)} />
          )}
        </AnimatePresence>
      </div>
      {/* Las dos regiones vivas existen desde el principio: el éxito se anuncia con cortesía, el error enseguida. */}
      <p role="status" className="sr-only">
        {vista === 'exito' ? `${mensajes.exito.titulo} ${mensajes.exito.linea}` : ''}
      </p>
      <p role="alert" className="sr-only">
        {vista === 'error' ? `${mensajes.error.titulo} ${mensajes.error.linea}` : ''}
      </p>
    </div>
  )
}

interface PropsDelResultado {
  readonly tipo: ResultadoDelEnvio
  readonly mensaje: MensajeDelEnvio
  readonly compacto: boolean
  readonly reducido: boolean
  readonly fundido: number
  readonly alVolver: () => void
}

/**
 * El encastre y el mensaje. El encastre arranca cuando la capa terminó de aparecer; el texto aparece cuando el encastre aterrizó y desde
 * ahí corre la cuenta del mensaje (`ENVIO.mensajeMs`). `data-tarjeta="resultado"` le da al encastre sus tintas (`resultado.css`), y
 * `data-envio="resultado"` las ata al contexto (`piezas.css`): la pieza en la tinta de la sección, la ranura más honda que su fondo.
 */
function EncajeConMensaje({ tipo, mensaje, compacto, reducido, fundido, alVolver }: PropsDelResultado): React.JSX.Element {
  const [empieza, setEmpieza] = useState(false)
  const [aterrizo, setAterrizo] = useState(false)
  const volver = useRef(alVolver)
  useEffect(() => {
    volver.current = alVolver
  })
  // El encastre arranca cuando la capa terminó de aparecer (un reloj, no el aviso de Motion: montada sin animar no avisaría).
  useEffect(() => {
    const arranca = window.setTimeout(() => setEmpieza(true), fundido * 1000)
    return () => window.clearTimeout(arranca)
  }, [fundido])
  useEffect(() => {
    if (!aterrizo) return undefined
    const cuenta = window.setTimeout(() => volver.current(), ENVIO.mensajeMs)
    return () => window.clearTimeout(cuenta)
  }, [aterrizo])
  return (
    <motion.div
      data-envio="resultado"
      data-tarjeta="resultado"
      data-resultado={tipo}
      className={cn('flex flex-col items-center text-center', compacto ? 'gap-[var(--spacing-2)]' : 'gap-[var(--spacing-4)]')}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: fundido, ease: CURVA } }}
      exit={{ opacity: 0, transition: { duration: fundido, ease: CURVA } }}
    >
      <div className={compacto ? 'w-[var(--spacing-20)]' : 'w-[calc(var(--spacing-20)*1.6)]'} style={{ aspectRatio: PROPORCION_DEL_ENCAJE }}>
        <EncajeDelLogo resultado={tipo === 'exito' ? 'encaja' : 'no-encaja'} empieza={empieza} quieto={reducido} alTerminar={() => setAterrizo(true)} />
      </div>
      <motion.div
        data-parte="mensaje-del-envio"
        className="flex flex-col items-center gap-[var(--spacing-1)]"
        initial={false}
        animate={aterrizo ? { opacity: 1, y: 0 } : { opacity: 0, y: reducido ? 0 : 8 }}
        transition={{ duration: reducido ? 0 : fundido, ease: CURVA }}
      >
        <p className={cn('font-display font-fuerte tracking-display leading-titulo uppercase', compacto ? 'text-cuerpo' : 'text-fluido-titulo-s')}>{mensaje.titulo}</p>
        <p className={cn('leading-texto max-w-[42ch]', compacto ? 'text-caption' : 'text-cuerpo')}>{mensaje.linea}</p>
      </motion.div>
    </motion.div>
  )
}
