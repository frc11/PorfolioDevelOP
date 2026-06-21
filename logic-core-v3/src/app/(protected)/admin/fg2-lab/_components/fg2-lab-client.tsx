'use client'

/**
 * 🧪 EXPERIMENTAL / DESCARTABLE — FG-2.0.
 * Formulario estructurado (rubro gastronomía) que ensambla un prompt para Claude
 * Design. Prototipo para correr el experimento de validación de la hipótesis de
 * FG-2, NO la versión productizada (eso es 2.1) ni parte del flujo del setter.
 * Borrar tras la decisión del experimento.
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, ListChecks } from 'lucide-react'
import { Button, Card, Field, Input, Select, Toggle } from '@/components/ui'
import {
  assembleGastroPrompt,
  estimarCostoPrompt,
  ESTILOS_GASTRO,
  TONOS_GASTRO,
  SECCIONES_GASTRO,
  CTAS_GASTRO,
  type CtaId,
  type EstiloVisualId,
  type Fg2BriefInput,
  type LabLead,
  type SeccionId,
  type TonoId,
} from '@/lib/leados/_experimental/fg2-brief-lab'
import { MedicionPanel } from './medicion-panel'

const SECCIONES_INICIALES: Record<SeccionId, boolean> = {
  'hero-plato': true,
  'menu-destacado': true,
  'sobre-nosotros': true,
  galeria: true,
  resenas: true,
  'ubicacion-horarios': true,
  'cta-contacto': true,
}

async function copiar(texto: string, okMsg: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(texto)
    toast.success(okMsg)
  } catch {
    toast.error('No se pudo copiar — copialo a mano desde la vista.')
  }
}

export function Fg2LabClient({ leads }: { leads: LabLead[] }) {
  const [selectedLeadId, setSelectedLeadId] = useState('')
  const [nombre, setNombre] = useState('')
  const [zona, setZona] = useState('')
  const [estilo, setEstilo] = useState<EstiloVisualId>(ESTILOS_GASTRO[0].id)
  const [tono, setTono] = useState<TonoId>(TONOS_GASTRO[0].id)
  const [secciones, setSecciones] = useState<Record<SeccionId, boolean>>(SECCIONES_INICIALES)
  const [cta, setCta] = useState<CtaId>(CTAS_GASTRO[0].id)
  const [whatsapp, setWhatsapp] = useState('')
  const [diferencial, setDiferencial] = useState('')
  const [colorMarca, setColorMarca] = useState('')
  const [resenas, setResenas] = useState('')
  const [tonoContenido, setTonoContenido] = useState('')
  const [instagram, setInstagram] = useState('')
  const [maps, setMaps] = useState('')
  const [web, setWeb] = useState('')

  const aplicarLead = (id: string) => {
    setSelectedLeadId(id)
    if (!id) return
    const lead = leads.find((l) => l.id === id)
    if (!lead) return
    setNombre(lead.businessName)
    setZona(lead.zone ?? '')
    setResenas(lead.resenas)
    setTonoContenido(lead.tonoContenido)
    setInstagram(lead.instagram)
    setMaps(lead.maps)
    setWeb(lead.web)
  }

  const toggleSeccion = (id: SeccionId, value: boolean) =>
    setSecciones((prev) => ({ ...prev, [id]: value }))

  // Derivados: el prompt y su costo son función pura del input — se recalculan en
  // render, no se guardan como estado (regla de estado derivado de React).
  const seccionesElegidas = SECCIONES_GASTRO.filter((s) => secciones[s.id]).map((s) => s.id)
  const input: Fg2BriefInput = {
    nombre,
    zona,
    estilo,
    tono,
    secciones: seccionesElegidas,
    cta,
    whatsapp,
    diferencial,
    colorMarca,
    resenas,
    tonoContenido,
    assets: { instagram, maps, web },
  }
  const prompt = assembleGastroPrompt(input)
  const costo = estimarCostoPrompt(prompt)
  const estiloLabel = ESTILOS_GASTRO.find((e) => e.id === estilo)?.label ?? ''

  const opcionesLead = [
    {
      value: '',
      label: leads.length
        ? '— Elegí un lead o cargá a mano —'
        : '— No hay leads con ficha · cargá a mano —',
    },
    ...leads.map((l) => ({
      value: l.id,
      label: l.industry ? `${l.businessName} · ${l.industry}` : l.businessName,
    })),
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      {/* ── Formulario ───────────────────────────────────────────────────── */}
      <Card padding="lg" className="space-y-5">
        <Field
          label="Autocompletar desde un lead"
          hint="Trae nombre, zona, reseñas y links de la ficha. Lo demás lo elegís vos."
        >
          <Select
            value={selectedLeadId}
            onChange={(e) => aplicarLead(e.target.value)}
            options={opcionesLead}
            disabled={leads.length === 0}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del negocio" required>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Bodegón La Esquina" />
          </Field>
          <Field label="Zona">
            <Input value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Caballito, CABA" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Estilo visual">
            <Select
              value={estilo}
              onChange={(e) => setEstilo(e.target.value as EstiloVisualId)}
              options={ESTILOS_GASTRO.map((o) => ({ value: o.id, label: o.label }))}
            />
          </Field>
          <Field label="Tono del copy">
            <Select
              value={tono}
              onChange={(e) => setTono(e.target.value as TonoId)}
              options={TONOS_GASTRO.map((o) => ({ value: o.id, label: o.label }))}
            />
          </Field>
        </div>

        <Field label="Secciones de la landing" hint="El orden de salida es el canónico del rubro.">
          <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            {SECCIONES_GASTRO.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-300">{s.label}</span>
                <Toggle
                  checked={secciones[s.id]}
                  onChange={(v) => toggleSeccion(s.id, v)}
                  label={s.label}
                />
              </div>
            ))}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CTA principal">
            <Select
              value={cta}
              onChange={(e) => setCta(e.target.value as CtaId)}
              options={CTAS_GASTRO.map((o) => ({ value: o.id, label: o.label }))}
            />
          </Field>
          <Field label="WhatsApp del negocio" hint="Número público, formato wa.me/549…">
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="5491122334455" />
          </Field>
        </div>

        <Field label="Diferencial / plato estrella" hint="El gancho real del negocio">
          <Input
            value={diferencial}
            onChange={(e) => setDiferencial(e.target.value)}
            placeholder="Milanesa napolitana de 600g, receta de la abuela"
          />
        </Field>

        <Field label="Color de marca" hint="Opcional — si el negocio tiene uno definido">
          <Input value={colorMarca} onChange={(e) => setColorMarca(e.target.value)} placeholder="Bordó #7a1f2b" />
        </Field>

        <Field label="Reseñas reales (prueba social)" hint="De la ficha — textuales, no inventar">
          <Input value={resenas} onChange={(e) => setResenas(e.target.value)} placeholder='"La mejor pizza del barrio…"' />
        </Field>

        <Field label="Tono y contenido real" hint="De la ficha — logo, fotos, voz del negocio">
          <Input
            value={tonoContenido}
            onChange={(e) => setTonoContenido(e.target.value)}
            placeholder="Postean platos del día, tono cercano y canchero"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Instagram">
            <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="instagram.com/…" />
          </Field>
          <Field label="Google Maps">
            <Input value={maps} onChange={(e) => setMaps(e.target.value)} placeholder="maps.app.goo.gl/…" />
          </Field>
          <Field label="Web actual">
            <Input value={web} onChange={(e) => setWeb(e.target.value)} placeholder="negocio.com" />
          </Field>
        </div>
      </Card>

      {/* ── Prompt + medición ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <Card padding="lg" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <ListChecks size={15} strokeWidth={1.5} className="text-cyan-300" />
              Prompt estructurado
            </h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void copiar(prompt, 'Prompt copiado — pegalo en Claude Design.')}
              icon={<Copy size={13} strokeWidth={1.5} />}
            >
              Copiar prompt
            </Button>
          </div>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-black/30 p-3 text-xs leading-relaxed text-zinc-300">
            {prompt}
          </pre>
        </Card>

        <MedicionPanel
          negocio={nombre}
          estiloLabel={estiloLabel}
          seccionesCount={seccionesElegidas.length}
          costo={costo}
        />
      </div>
    </div>
  )
}
