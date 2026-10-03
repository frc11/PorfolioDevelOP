'use client'

import { BookOpen, MessageCircle, ShieldOff } from 'lucide-react'
import { useId, useRef, useState } from 'react'

import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { adminHoverCls } from '@/lib/hover'

import { mostrarArriba } from '../../desplazar'
import { MarcoDelPanel } from '../../MarcoDelPanel'
import { useReproduccion } from '../../reproduccion'
import { BASE_DE_EJEMPLO, type BaseDeEjemplo } from './conocimiento'
import { EncabezadoDelChatbot } from './EncabezadoDelChatbot'

/**
 * [NOCTURNO] B · FEATURE 8 — «Configurá cómo responde tu chatbot»: «Lo que sabe tu chatbot», la pestaña Información del
 * panel (`/dashboard/chatbot/knowledge`). COPIA de `modules/chatbot/components/dashboard/ClientKnowledgeView.tsx` (sus
 * siete campos con sus títulos, descripciones y la marca «Configurado por develOP»; `Card` y `Section` IMPORTADOS de
 * `components/ui/`): su llamado «Pedinos el cambio desde Mensajes» es un `<Link>` a `/dashboard/messages`; acá lleva a la
 * demo del chat. Navegable: el índice de las siete secciones lleva a cada una adentro del panel (y le da el foco).
 * [RETOQUE PANEL] T1 · en su lugar, el llamado queda como texto (no hay otra demo a la que saltar).
 */
interface Campo {
  readonly key: keyof BaseDeEjemplo
  readonly title: string
  readonly description: string
  readonly protegido?: boolean
}

const FIELDS: readonly Campo[] = [
  { key: 'businessInfo', title: 'Información del negocio', description: 'Quiénes son, dónde están, datos generales que el bot usa al presentarse.' },
  { key: 'servicesOrProducts', title: 'Servicios o productos', description: 'Catálogo de lo que ofrecés y precios — lo que el bot puede mencionar.' },
  { key: 'faq', title: 'Preguntas frecuentes', description: 'Respuestas a las dudas más comunes de tus clientes.' },
  { key: 'policies', title: 'Políticas', description: 'Reglas, condiciones comerciales, envíos, devoluciones.' },
  { key: 'salesGuidance', title: 'Guía de derivación / ventas', description: 'Cómo el bot identifica leads listos y cuándo te los pasa.' },
  { key: 'toneExamples', title: 'Ejemplos de tono', description: 'Frases que orientan al bot a hablar como tu marca.', protegido: true },
  { key: 'forbiddenStatements', title: 'Frases prohibidas', description: 'Cosas que el bot tiene prohibido decir.', protegido: true },
]

export default function LoQueSabe(): React.JSX.Element {
  const r = useReproduccion()
  const raiz = useRef<HTMLDivElement>(null)
  const [marcada, setMarcada] = useState<keyof BaseDeEjemplo | null>(null)
  const base = useId()
  const idDe = (k: keyof BaseDeEjemplo): string => `${base}-kb-${k}`
  const ir = (k: keyof BaseDeEjemplo): void => {
    const el = document.getElementById(idDe(k))
    mostrarArriba(el, !r.reducido)
    el?.focus({ preventScroll: true })
    setMarcada(k)
  }

  return (
    <MarcoDelPanel item="chatbot">
      <div ref={raiz} className="flex flex-col gap-6">
        <EncabezadoDelChatbot activa="knowledge" />
        <div className="space-y-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10">
              <BookOpen className="h-4 w-4 text-cyan-300" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-zinc-100">Lo que sabe tu chatbot</h2>
              <p className="text-sm text-zinc-400">Esta es la base de conocimiento que usa el bot para responder. La curamos con develOP para asegurar consistencia y que no responda algo incorrecto.</p>
            </div>
          </div>
          <Card padding="md">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10">
                <MessageCircle className="h-4 w-4 text-cyan-300" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-sm font-medium text-zinc-100">¿Necesitás actualizar algo?</div>
                <p className="text-xs leading-relaxed text-zinc-400">
                  Cambió algo, sumaste un servicio, querés agregar una respuesta — lo que sea.{' '}
                  <span className="text-cyan-400">Pedinos el cambio desde Mensajes</span>{' '}
                  y lo aplicamos por vos.
                </p>
              </div>
            </div>
          </Card>
          <Section title="Contenido actual" description="Lo que tu chatbot tiene cargado hoy. Si encontrás algo desactualizado o incorrecto, avisanos.">
            <nav aria-label="Secciones de lo que sabe tu chatbot" className="flex flex-wrap gap-2">
              {FIELDS.map((f) => (
                <button key={f.key} type="button" onClick={() => ir(f.key)} aria-current={marcada === f.key ? 'true' : undefined} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400 ${marcada === f.key ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-300' : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white'}`}>
                  {f.title}
                </button>
              ))}
            </nav>
            <div className="space-y-7">
              {FIELDS.map((f) => (
                <Card key={f.key} id={idDe(f.key)} tabIndex={-1} padding="lg" className={`space-y-3 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${adminHoverCls} ${marcada === f.key ? 'ring-1 ring-cyan-400/40' : ''}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <h3 className="text-sm font-semibold text-zinc-100">{f.title}</h3>
                      <p className="text-xs text-zinc-500">{f.description}</p>
                    </div>
                    {f.protegido === true && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                        <ShieldOff className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                        Configurado por develOP
                      </span>
                    )}
                  </div>
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-zinc-200">{BASE_DE_EJEMPLO[f.key]}</pre>
                </Card>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </MarcoDelPanel>
  )
}
