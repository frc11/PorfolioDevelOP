import { BookOpen, MessageCircle, ShieldOff } from 'lucide-react'
import Link from 'next/link'
import type { KnowledgeBase } from '@prisma/client'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { adminHoverCls } from '@/lib/hover'

interface ClientKnowledgeViewProps {
  kb: KnowledgeBase
}

interface FieldDef {
  key: keyof Pick<
    KnowledgeBase,
    | 'businessInfo'
    | 'servicesOrProducts'
    | 'faq'
    | 'policies'
    | 'salesGuidance'
    | 'toneExamples'
    | 'forbiddenStatements'
  >
  title: string
  description: string
  emptyHint: string
  protected?: boolean
}

const FIELDS: FieldDef[] = [
  {
    key: 'businessInfo',
    title: 'Información del negocio',
    description: 'Quiénes son, dónde están, datos generales que el bot usa al presentarse.',
    emptyHint: 'Todavía no cargamos esta sección. Pedinos el cambio para sumarla.',
  },
  {
    key: 'servicesOrProducts',
    title: 'Servicios o productos',
    description: 'Catálogo de lo que ofrecés y precios — lo que el bot puede mencionar.',
    emptyHint: 'Todavía no cargamos esta sección. Pedinos el cambio para sumarla.',
  },
  {
    key: 'faq',
    title: 'Preguntas frecuentes',
    description: 'Respuestas a las dudas más comunes de tus clientes.',
    emptyHint: 'Todavía no cargamos esta sección. Pedinos el cambio para sumarla.',
  },
  {
    key: 'policies',
    title: 'Políticas',
    description: 'Reglas, condiciones comerciales, envíos, devoluciones.',
    emptyHint: 'Todavía no cargamos esta sección. Pedinos el cambio para sumarla.',
  },
  {
    key: 'salesGuidance',
    title: 'Guía de derivación / ventas',
    description: 'Cómo el bot identifica leads listos y cuándo te los pasa.',
    emptyHint: 'Todavía no cargamos esta sección. Pedinos el cambio para sumarla.',
  },
  {
    key: 'toneExamples',
    title: 'Ejemplos de tono',
    description: 'Frases que orientan al bot a hablar como tu marca.',
    emptyHint: 'develOP no cargó ejemplos de tono todavía.',
    protected: true,
  },
  {
    key: 'forbiddenStatements',
    title: 'Frases prohibidas',
    description: 'Cosas que el bot tiene prohibido decir.',
    emptyHint: 'develOP no definió frases prohibidas todavía.',
    protected: true,
  },
]

function FieldBlock({ field, content }: { field: FieldDef; content: string }) {
  const isEmpty = content.trim().length === 0

  return (
    <Card padding="lg" className={`space-y-3 ${adminHoverCls}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <h3 className="text-sm font-semibold text-zinc-100">{field.title}</h3>
          <p className="text-xs text-zinc-500">{field.description}</p>
        </div>
        {field.protected && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
            <ShieldOff className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
            Configurado por develOP
          </span>
        )}
      </div>

      {isEmpty ? (
        <p className="text-sm italic leading-relaxed text-zinc-500">{field.emptyHint}</p>
      ) : (
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-zinc-200">
          {content}
        </pre>
      )}
    </Card>
  )
}

/**
 * CC.3 — Vista read-only de la KB del cliente.
 *
 * El cliente VE qué sabe su bot (los 7 campos) pero NO los edita. La edición
 * la hace develOP desde el admin. La server action de escritura del lado cliente
 * está eliminada (defense-in-depth): aunque alguien construya un POST a mano,
 * no hay endpoint del lado cliente que reciba escrituras.
 *
 * Mensaje claro de "pedir cambios" arriba — el cliente entiende cómo actualizar,
 * no queda con una vista muerta sin explicación.
 */
export function ClientKnowledgeView({ kb }: ClientKnowledgeViewProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10">
          <BookOpen
            className="h-4 w-4 text-cyan-300"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-zinc-100">
            Lo que sabe tu chatbot
          </h1>
          <p className="text-sm text-zinc-400">
            Esta es la base de conocimiento que usa el bot para responder. La curamos
            con develOP para asegurar consistencia y que no responda algo incorrecto.
          </p>
        </div>
      </div>

      {/* CTA — pedir cambios */}
      <Card padding="md">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10">
            <MessageCircle
              className="h-4 w-4 text-cyan-300"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="text-sm font-medium text-zinc-100">
              ¿Necesitás actualizar algo?
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              Cambió un precio, sumaste un servicio, querés agregar una respuesta —
              lo que sea.{' '}
              <Link
                href="/dashboard/messages?context=knowledge"
                className="text-cyan-400 underline-offset-2 hover:text-cyan-300 hover:underline"
              >
                Pedinos el cambio desde Mensajes
              </Link>{' '}
              y lo aplicamos por vos.
            </p>
          </div>
        </div>
      </Card>

      {/* Contenido KB */}
      <Section
        title="Contenido actual"
        description="Lo que tu chatbot tiene cargado hoy. Si encontrás algo desactualizado o incorrecto, avisanos."
      >
        <div className="space-y-7">
          {FIELDS.map((field) => (
            <FieldBlock key={field.key} field={field} content={kb[field.key] ?? ''} />
          ))}
        </div>
      </Section>
    </div>
  )
}
