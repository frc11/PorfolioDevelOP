'use client'

import { MessageSquarePlus, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import * as z from 'zod'

import { TicketCategory, TicketPriority } from '@/lib/prisma-enums'

import type { CategoriaDelTicket, PrioridadDelTicket } from './datos'

/**
 * [NOCTURNO] B · EL TICKET NUEVO — COPIA de `components/dashboard/NewTicketModal.tsx`: el mismo formulario (Asunto,
 * Categoría, Prioridad, Descripción), la misma validación con Zod en el cliente y sus mensajes, el mismo aspecto. Lo que
 * cambia, y por qué: allá envía con `createTicketAction` (server action) y navega con `router.push`; acá NO ENVÍA NADA:
 * el ticket se agrega a la lista de la demo. Allá es un modal `fixed` sobre toda la pantalla; acá va adentro del marco
 * del panel (con el foco atrapado, Escape para cerrar y el foco de vuelta al botón que lo abrió). Los selects son los
 * nativos (el `Select` de `components/ui` abre su lista en un portal al `body`, detrás de la ampliación). Los rótulos
 * quedan atados a su campo (en el original no lo están).
 */
const esquema = z.object({
  title: z.string().min(5, 'El titulo debe tener al menos 5 caracteres.'),
  category: z.nativeEnum(TicketCategory),
  priority: z.nativeEnum(TicketPriority),
  message: z.string().min(10, 'Describe tu problema con mas detalle (min. 10 caracteres).'),
})

export interface TicketNuevo {
  readonly title: string
  readonly category: CategoriaDelTicket
  readonly priority: PrioridadDelTicket
  readonly message: string
}

const CAMPO = 'w-full rounded-lg border border-white/10 bg-[#080a0c] px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500'
const ROTULO = 'mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400'
const FOCALIZABLES = 'button, input, select, textarea'

export function FormularioDeTicket({ alCrear, alCerrar }: { readonly alCrear: (t: TicketNuevo) => void; readonly alCerrar: () => void }): React.JSX.Element {
  const id = useId()
  const caja = useRef<HTMLDivElement>(null)
  const primero = useRef<HTMLInputElement>(null)
  const [errores, setErrores] = useState<Partial<Record<'title' | 'message', string>>>({})
  useEffect(() => {
    primero.current?.focus()
  }, [])

  const enviar = (form: HTMLFormElement): void => {
    const datos = new FormData(form)
    const r = esquema.safeParse({ title: String(datos.get('title') ?? ''), category: datos.get('category') ?? 'TECHNICAL', priority: datos.get('priority') ?? 'MEDIUM', message: String(datos.get('message') ?? '') })
    if (!r.success) {
      const siguientes: Partial<Record<'title' | 'message', string>> = {}
      for (const issue of r.error.issues) {
        const campo = issue.path[0]
        if ((campo === 'title' || campo === 'message') && siguientes[campo] === undefined) siguientes[campo] = issue.message
      }
      setErrores(siguientes)
      form.querySelector<HTMLElement>(siguientes.title !== undefined ? '[name="title"]' : '[name="message"]')?.focus()
      return
    }
    alCrear(r.data)
  }

  // Escape cierra el formulario (no la ampliación de atrás); Tab da la vuelta adentro.
  const alTeclear = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      alCerrar()
      return
    }
    if (e.key !== 'Tab') return
    const focos = caja.current?.querySelectorAll<HTMLElement>(FOCALIZABLES)
    if (focos === undefined || focos.length === 0) return
    e.stopPropagation()
    const [a, z2] = [focos[0], focos[focos.length - 1]]
    if (e.shiftKey && document.activeElement === a) {
      e.preventDefault()
      z2.focus()
    } else if (!e.shiftKey && document.activeElement === z2) {
      e.preventDefault()
      a.focus()
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center px-4" onKeyDown={alTeclear}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={alCerrar} className="absolute inset-0 bg-black/70" />
      <motion.div ref={caja} role="dialog" aria-modal="true" aria-labelledby={`${id}-titulo`} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e12] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] p-6">
          <h2 id={`${id}-titulo`} className="flex items-center gap-2 text-xl font-bold text-white">
            <MessageSquarePlus className="text-cyan-400" size={20} strokeWidth={1.5} aria-hidden />
            Crear Ticket de Soporte
          </h2>
          <button type="button" onClick={alCerrar} aria-label="Cerrar" className="cursor-pointer text-zinc-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400">
            <X size={20} strokeWidth={1.5} aria-hidden />
          </button>
        </div>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            enviar(e.currentTarget)
          }}
          className="space-y-4 p-6"
        >
          <div>
            <label htmlFor={`${id}-asunto`} className={ROTULO}>
              Asunto
            </label>
            <input ref={primero} id={`${id}-asunto`} name="title" aria-invalid={errores.title !== undefined} aria-describedby={errores.title ? `${id}-e-asunto` : undefined} className={CAMPO} placeholder="Ej: Problema con la carga del sitio web" />
            {errores.title && <p id={`${id}-e-asunto`} className="mt-1 text-xs text-red-400">{errores.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${id}-categoria`} className={ROTULO}>
                Categoria
              </label>
              <select id={`${id}-categoria`} name="category" defaultValue="TECHNICAL" className={`${CAMPO} cursor-pointer`}>
                <option value="TECHNICAL">Soporte Tecnico</option>
                <option value="BILLING">Facturacion</option>
                <option value="FEATURE_REQUEST">Nuevo Requerimiento</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-prioridad`} className={ROTULO}>
                Prioridad
              </label>
              <select id={`${id}-prioridad`} name="priority" defaultValue="MEDIUM" className={`${CAMPO} cursor-pointer`}>
                <option value="LOW">Baja (Mantenimiento)</option>
                <option value="MEDIUM">Media (Estandar)</option>
                <option value="HIGH">Alta (Bloqueante)</option>
                <option value="URGENT">Urgente (Critico)</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={`${id}-descripcion`} className={ROTULO}>
              Descripcion Detallada
            </label>
            <textarea id={`${id}-descripcion`} name="message" aria-invalid={errores.message !== undefined} aria-describedby={errores.message ? `${id}-e-descripcion` : undefined} className={`${CAMPO} h-32 resize-none text-zinc-300`} placeholder="Explica el contexto. Nuestro equipo asincrono lo evaluara a fondo..." />
            {errores.message && <p id={`${id}-e-descripcion`} className="mt-1 text-xs text-red-400">{errores.message}</p>}
          </div>
          <p className="text-[11px] text-zinc-500">Es un ejemplo: el ticket se agrega a la lista y no se envía nada.</p>
          <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
            <button type="button" onClick={alCerrar} className="cursor-pointer px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400">
              Cancelar
            </button>
            <button type="submit" className="flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-bold text-black shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
              Abrir Ticket
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
