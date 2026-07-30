import { MonoLabel } from '@/components/design-system'

/**
 * La lámina de producto: el marco de dispositivo que en el rediseño va a
 * contener el panel.
 *
 * Todo CSS — borde, canto superior iluminado, sombra corta. Sin imágenes
 * externas y sin blur (el glassmorphism está prohibido). Lo que se muestra es el
 * ENCUADRE, no el contenido: adentro va un wireframe de barras neutras y un
 * cartel de pendiente. No hay ninguna cifra, ni ninguna captura falsa.
 */
export function ProductPlate() {
  return (
    <div className="flex flex-col gap-8">
      {/* Marco exterior: es el "canto" de la lámina. */}
      <div
        className="
          border border-ds-rule border-t-ds-control-edge
          bg-ds-panel p-2 shadow-ds-control rounded-ds-surface
          md:p-3
        "
      >
        {/* Barra de chrome del dispositivo. */}
        <div className="flex items-center justify-between border-b border-ds-rule px-3 pb-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2 border border-ds-rule" />
            <span className="size-2 border border-ds-rule" />
            <span className="size-2 border border-ds-rule" />
          </div>
          <MonoLabel>Panel del cliente</MonoLabel>
        </div>

        {/* Interior: wireframe. Sin datos. */}
        <div className="grid gap-3 bg-ds-canvas p-4 md:grid-cols-[180px_1fr] md:p-6">
          {/* Sidebar */}
          <div className="hidden flex-col gap-2 border-r border-ds-rule pr-4 md:flex" aria-hidden="true">
            {[64, 48, 56, 40, 52].map((width, index) => (
              <span
                key={index}
                className="h-3 bg-ds-rule"
                style={{ width: `${width}%` }}
              />
            ))}
          </div>

          {/* Cuerpo */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2" aria-hidden="true">
              <span className="h-4 w-1/3 bg-ds-rule" />
              <span className="h-3 w-1/2 bg-ds-rule" />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 border border-ds-rule p-3 rounded-ds-surface"
                >
                  <span className="h-2 w-2/3 bg-ds-rule" aria-hidden="true" />
                  <span className="h-6 w-1/2 bg-ds-rule" aria-hidden="true" />
                </div>
              ))}
            </div>

            <div className="flex min-h-[140px] items-center justify-center border border-dashed border-ds-rule p-6 text-center rounded-ds-surface">
              <span className="font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">
                [CAPTURA DEL PANEL — PENDIENTE DE FRANCO]
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
        El marco no lleva blur ni translucidez, y el radio de la lámina es 0 como cualquier
        superficie. Lo único que la levanta del fondo es el canto superior de 1px más claro y la
        sombra corta de dos capas — el mismo relieve del control primario, que es el vocabulario
        del sistema para &quot;esto está por encima&quot;.
      </p>
    </div>
  )
}
