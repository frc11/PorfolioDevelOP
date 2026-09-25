'use client'

import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { Cta } from '../../_componentes/chrome/Cta'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { useDialogo } from '../../_secciones/trabajos/demos/dialogo'
import { cerrarContacto, devolverElFoco, useContacto, type ModoDelChrome } from './apertura'
import { CamposDelContacto } from './CamposDelContacto'
import { BAJADA, DESPUES_DEL_ENVIO, PIE, ROTULO_DE_CERRAR, ROTULO_DEL_ENVIO, TITULO, type Interes } from './contenido'
import { enviarContacto, validarContacto, type DatosDeContacto, type ErroresDeContacto } from './enviarContacto'

/**
 * EL FORMULARIO DE CONTACTO — la hoja y su velo. **[CONTACTO]**
 *
 * Con la barra de escritorio la hoja BAJA desde arriba, a todo el ancho con el contenido
 * centrado y los bordes de abajo redondeados; con el menú móvil SUBE desde abajo y ocupa la
 * pantalla (en `dvh`, para que el teclado no la tape). El velo oscurece y desenfoca el sitio.
 * Es un diálogo: foco atrapado, Esc, overflow en `<html>` y `data-lenis-prevent` —el mismo
 * `useDialogo` de las demos—, y al cerrar el foco vuelve a quien lo abrió.
 *
 * La curva es la medida en nk: `cubic-bezier(.77,0,.175,1)`, 0,7 s la hoja y 0,4 s el velo.
 */

const CURVA = [0.77, 0, 0.175, 1] as const
export const MS_DE_LA_HOJA = 700
export const MS_DEL_VELO = 400

const VACIO: Omit<DatosDeContacto, 'intereses'> = { presupuesto: '', nombre: '', medio: '', empresa: '', mensaje: '' }

export function FormularioDeContacto(): React.JSX.Element {
  const { abierto, precarga, modo } = useContacto()
  return <AnimatePresence onExitComplete={devolverElFoco}>{abierto && <Hoja key="contacto" precarga={precarga} modo={modo} />}</AnimatePresence>
}

/** La hoja sola, sin el estado del chrome: para el invariante, que la renderiza en el servidor. */
export function HojaParaElInvariante({ precarga = [] }: { readonly precarga?: readonly Interes[] }): React.JSX.Element {
  return <Hoja precarga={precarga} modo="barra" />
}

function Hoja({ precarga, modo }: { readonly precarga: readonly Interes[]; readonly modo: ModoDelChrome }): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  const reducido = useMovimientoReducido()
  useDialogo(caja, cerrarContacto)
  const [datos, setDatos] = useState<DatosDeContacto>({ intereses: precarga, ...VACIO })
  const [errores, setErrores] = useState<ErroresDeContacto>({})
  const [intento, setIntento] = useState(false)
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null)

  const actualizar = useCallback(
    (siguiente: DatosDeContacto) => {
      setDatos(siguiente)
      // Después del primer intento, los errores se corrigen mientras se escribe.
      if (intento) setErrores(validarContacto(siguiente))
    },
    [intento],
  )
  const alternarInteres = (id: Interes): void =>
    actualizar({ ...datos, intereses: datos.intereses.includes(id) ? datos.intereses.filter((i) => i !== id) : [...datos.intereses, id] })
  const escribir = (campo: keyof typeof VACIO, valor: string): void => actualizar({ ...datos, [campo]: valor })

  const alEnviar = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    setIntento(true)
    const r = enviarContacto(datos)
    if (r.estado === 'invalido') {
      setErrores(r.errores)
      // El foco va al primer campo con error, después de que el render lo marque.
      const form = e.currentTarget
      const primero = r.errores.intereses !== undefined ? '[data-pieza="chip-de-contacto"] input' : '[aria-invalid="true"]'
      requestAnimationFrame(() => form.querySelector<HTMLElement>(primero)?.focus())
      return
    }
    setErrores({})
    setAbiertoEn(r.url)
  }

  const desdeArriba = modo === 'barra'
  const fuera = desdeArriba ? '-100%' : '100%'
  const hoja = reducido ? { duration: 0 } : { duration: MS_DE_LA_HOJA / 1000, ease: CURVA }
  const velo = reducido ? { duration: 0 } : { duration: MS_DEL_VELO / 1000, ease: CURVA }

  return (
    <div data-pieza="contacto" data-modo={modo} className="fixed inset-0 z-[var(--z-overlay)]">
      {/* El velo: oscurece y desenfoca. Un click afuera cierra. */}
      <motion.div
        data-parte="velo"
        aria-hidden="true"
        onClick={cerrarContacto}
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-tinta)_35%,transparent)] backdrop-blur-[var(--blur-panel)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={velo}
      />
      <motion.div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contacto-titulo"
        data-parte="hoja"
        data-lenis-prevent=""
        className={cn(
          'bg-fondo text-tinta absolute inset-x-0 overflow-y-auto overscroll-contain shadow-[var(--shadow-flotante)] will-change-transform',
          desdeArriba ? 'top-0 max-h-[90svh] rounded-b-[calc(var(--radius-fuerte)*2)]' : 'bottom-0 h-[100dvh]',
        )}
        initial={{ y: fuera }}
        animate={{ y: 0 }}
        exit={{ y: fuera }}
        transition={hoja}
      >
        <div className="mx-auto flex w-full max-w-[min(100%,calc(var(--spacing-20)*14))] flex-col gap-[var(--spacing-8)] px-[var(--pad-lateral-compacto)] py-[var(--spacing-12)]">
          <div className="flex items-start justify-between gap-[var(--spacing-6)]">
            <div className="flex flex-col gap-[var(--spacing-2)]">
              <h2 id="contacto-titulo" className="text-fluido-titulo-l font-titulo leading-titulo tracking-titulo">
                {TITULO}
              </h2>
              <p className="text-cuerpo leading-texto max-w-[60ch]">
                {BAJADA.antes}
                <a href={BAJADA.mail.href} className="underline decoration-1 underline-offset-4">
                  {BAJADA.mail.rotulo}
                </a>
                {BAJADA.medio}
                <a href={BAJADA.whatsapp.href} target="_blank" rel="noopener noreferrer" className="underline decoration-1 underline-offset-4">
                  {BAJADA.whatsapp.rotulo}
                </a>
                {BAJADA.despues}
              </p>
            </div>
            <button
              type="button"
              onClick={cerrarContacto}
              aria-label={ROTULO_DE_CERRAR}
              className="border-borde-fuerte hover:border-tinta flex size-[var(--spacing-12)] shrink-0 items-center justify-center rounded-[var(--radius-medio)] border transition-colors"
            >
              <X aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-5)]" />
            </button>
          </div>

          <form noValidate onSubmit={alEnviar} className="flex flex-col gap-[var(--spacing-8)]">
            <CamposDelContacto datos={datos} errores={errores} alternarInteres={alternarInteres} escribir={escribir} />
            <div className="border-borde flex flex-col gap-[var(--spacing-4)] border-t pt-[var(--spacing-6)] tablet:flex-row tablet:items-center tablet:justify-between">
              <p className="text-caption leading-texto">{PIE}</p>
              <Cta type="submit" rotulo={ROTULO_DEL_ENVIO} />
            </div>
            {abiertoEn !== null && (
              <p role="status" className="text-caption leading-texto">
                {DESPUES_DEL_ENVIO.texto}{' '}
                <a href={abiertoEn} target="_blank" rel="noopener noreferrer" className="underline decoration-1 underline-offset-4">
                  {DESPUES_DEL_ENVIO.reintento}
                </a>
                .
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  )
}
