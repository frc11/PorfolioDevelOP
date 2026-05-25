'use client'

import type { InstallPlatformId } from './platforms'

/**
 * Per-platform install instructions. Audience-neutral wording so the same
 * component works for the client-facing dashboard view and the admin tab.
 * The wrappers around this control the surrounding copy that *is* audience-
 * specific (e.g. paused-bot warnings).
 */
export function PlatformInstructions({ platform }: { platform: InstallPlatformId }) {
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
            ⚠ Wix free no permite scripts custom — se necesita plan Business o superior.
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
            <code className="text-cyan-400">&lt;/body&gt;</code> en todas las páginas donde
            querés que aparezca el chatbot.
          </p>
          <p className="text-zinc-400 mt-2">
            Si tu plataforma no permite scripts custom, contactanos.
          </p>
        </div>
      )
  }
}
