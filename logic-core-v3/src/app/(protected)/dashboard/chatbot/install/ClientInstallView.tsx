'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'

interface Props {
  bot: {
    slug: string
    botName: string
    isActive: boolean
    allowedDomains: string[]
  }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://develop.com.ar'

const PLATFORMS = [
  { id: 'html', label: 'HTML estático', icon: '📄' },
  { id: 'wordpress', label: 'WordPress', icon: '🔌' },
  { id: 'tiendanube', label: 'Tiendanube', icon: '🛒' },
  { id: 'shopify', label: 'Shopify', icon: '🛍️' },
  { id: 'wix', label: 'Wix', icon: '🟦' },
  { id: 'squarespace', label: 'Squarespace', icon: '⬛' },
  { id: 'other', label: 'Otro / Custom', icon: '⚙️' },
] as const

type PlatformId = (typeof PLATFORMS)[number]['id']

export function ClientInstallView({ bot }: Props) {
  const [platform, setPlatform] = useState<PlatformId>('html')
  const [copied, setCopied] = useState(false)

  const snippet = `<script src="${APP_URL}/widget.js" data-bot="${bot.slug}" data-theme="dark"></script>`

  function copySnippet() {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    toast.success('Snippet copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {!bot.isActive && (
        <Card padding="md" className="border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-amber-300">El bot está pausado</p>
              <p className="text-xs text-amber-300/70 mt-1">
                El chatbot no va a responder hasta que tu equipo lo active.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Paso 1 — Snippet */}
      <Card padding="lg">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-2">Paso 1</p>
        <h3 className="text-base font-medium text-zinc-200 mb-1">Snippet a copiar</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Pegá este código en tu sitio y el chatbot va a aparecer automáticamente.
        </p>

        <div className="relative">
          <pre className="rounded-xl bg-zinc-950 border border-white/10 p-4 text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {snippet}
          </pre>
          <button
            onClick={copySnippet}
            className="absolute top-2 right-2 p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
            aria-label="Copiar snippet"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} />
            ) : (
              <Copy className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            )}
          </button>
        </div>

        <p className="text-xs text-zinc-500 mt-3">
          Va antes del cierre de <code className="text-cyan-400">&lt;/body&gt;</code> en tu sitio
        </p>
      </Card>

      {/* Paso 2 — Instrucciones por plataforma */}
      <Card padding="lg">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-2">Paso 2</p>
        <h3 className="text-base font-medium text-zinc-200 mb-4">Instrucciones por plataforma</h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                platform === p.id
                  ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300'
                  : 'border-white/10 bg-white/[0.02] text-zinc-300 hover:bg-white/[0.04]'
              }`}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <PlatformInstructions platform={platform} />
        </div>
      </Card>

      {/* Paso 3 — Verificar */}
      {bot.allowedDomains.length > 0 && (
        <Card padding="lg">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-2">Paso 3</p>
          <h3 className="text-base font-medium text-zinc-200 mb-3">Verificar instalación</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Una vez instalado, abrí tu sitio y buscá la burbuja de chat flotante en la esquina.
          </p>
          <div className="flex flex-wrap gap-2">
            {bot.allowedDomains.map((domain) => (
              <a
                key={domain}
                href={`https://${domain.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04]"
              >
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                {domain}
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function PlatformInstructions({ platform }: { platform: PlatformId }) {
  switch (platform) {
    case 'html':
      return (
        <div className="space-y-2 text-sm text-zinc-300">
          <p className="font-medium">Sitio HTML estático</p>
          <ol className="list-decimal pl-5 space-y-2 text-zinc-400">
            <li>
              Abrí tu archivo principal (generalmente{' '}
              <code className="text-cyan-400">index.html</code>)
            </li>
            <li>
              Buscá el cierre de <code className="text-cyan-400">&lt;/body&gt;</code> al final
            </li>
            <li>Pegá el snippet justo antes de esa línea</li>
            <li>Guardá y subí el archivo a tu servidor</li>
            <li>Refrescá tu sitio — deberías ver una burbuja flotante</li>
          </ol>
        </div>
      )
    case 'wordpress':
      return (
        <div className="space-y-2 text-sm text-zinc-300">
          <p className="font-medium">WordPress</p>
          <p className="text-zinc-400">
            Opción A — Plugin &ldquo;Insert Headers and Footers&rdquo; (más fácil):
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-zinc-400">
            <li>Instalá el plugin desde Plugins → Añadir nuevo</li>
            <li>Ir a Ajustes → Insert Headers and Footers</li>
            <li>Pegá el snippet en la sección &ldquo;Scripts in Footer&rdquo;</li>
            <li>Guardar</li>
          </ol>
          <p className="text-zinc-400 mt-3">Opción B — Editar tema directamente:</p>
          <ol className="list-decimal pl-5 space-y-1 text-zinc-400">
            <li>Apariencia → Editor de temas → footer.php</li>
            <li>
              Pegar antes de <code className="text-cyan-400">&lt;/body&gt;</code>
            </li>
          </ol>
        </div>
      )
    case 'tiendanube':
      return (
        <div className="space-y-2 text-sm text-zinc-300">
          <p className="font-medium">Tiendanube</p>
          <ol className="list-decimal pl-5 space-y-2 text-zinc-400">
            <li>Entrá a tu administrador de Tiendanube</li>
            <li>Configuración → Códigos externos</li>
            <li>Pegá el snippet en &ldquo;Scripts antes de &lt;/body&gt;&rdquo;</li>
            <li>Guardar cambios</li>
            <li>El widget aparece en todas las páginas de la tienda</li>
          </ol>
        </div>
      )
    case 'shopify':
      return (
        <div className="space-y-2 text-sm text-zinc-300">
          <p className="font-medium">Shopify</p>
          <ol className="list-decimal pl-5 space-y-2 text-zinc-400">
            <li>Online Store → Themes → Customize</li>
            <li>Actions → Edit code</li>
            <li>
              Buscar <code className="text-cyan-400">theme.liquid</code>
            </li>
            <li>
              Pegar el snippet antes de <code className="text-cyan-400">&lt;/body&gt;</code>
            </li>
            <li>Save</li>
          </ol>
        </div>
      )
    case 'wix':
      return (
        <div className="space-y-2 text-sm text-zinc-300">
          <p className="font-medium">Wix</p>
          <ol className="list-decimal pl-5 space-y-2 text-zinc-400">
            <li>Ir a tu editor Wix → Settings</li>
            <li>Custom Code (necesita plan Business+)</li>
            <li>+ Add Custom Code</li>
            <li>Pegar el snippet</li>
            <li>Apply to: All pages, Place code in: Body — end</li>
            <li>Click Apply</li>
          </ol>
          <p className="text-xs text-amber-300 mt-2">
            ⚠ Wix free no permite scripts custom — necesitás plan Business o superior.
          </p>
        </div>
      )
    case 'squarespace':
      return (
        <div className="space-y-2 text-sm text-zinc-300">
          <p className="font-medium">Squarespace</p>
          <ol className="list-decimal pl-5 space-y-2 text-zinc-400">
            <li>Settings → Advanced → Code Injection</li>
            <li>Pegar el snippet en &ldquo;Footer&rdquo;</li>
            <li>Save</li>
          </ol>
        </div>
      )
    default:
      return (
        <div className="space-y-2 text-sm text-zinc-300">
          <p className="font-medium">Otra plataforma</p>
          <p className="text-zinc-400">
            La regla general: pegá el snippet antes del cierre de{' '}
            <code className="text-cyan-400">&lt;/body&gt;</code> en todas las páginas donde querés
            el chatbot.
          </p>
          <p className="text-zinc-400 mt-2">
            Si tu plataforma no permite scripts custom, contactanos.
          </p>
        </div>
      )
  }
}
